import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";

const SIGNBRIDGE_CMD = "signbridge.v1";

function buildCaptionPayload(text, label, confidence, fromUserName, sendSeqRef) {
  const clippedTranscript = String(text ?? "").slice(-180);
  const token = String(label ?? "").trim();
  return {
    v: 1,
    type: SIGNBRIDGE_CMD,
    transcript: clippedTranscript || token,
    token,
    label: token,
    confidence: confidence ?? 0,
    fromUserName: fromUserName || "Guest",
    seq: (sendSeqRef.current += 1),
  };
}

const VideoCall = forwardRef(({ roomID, userName, onRemoteCaption }, ref) => {
  const containerRef = useRef(null);
  const zegoRef = useRef(null);
  const localUserIdRef = useRef("");
  const onRemoteCaptionRef = useRef(onRemoteCaption);
  const userNameRef = useRef(userName || "Guest");
  const sendSeqRef = useRef(0);
  const roomJoinedRef = useRef(false);
  const remoteUserIdsRef = useRef(new Set());
  const pendingCaptionsRef = useRef([]);
  const deliverCaptionRef = useRef(null);

  useEffect(() => {
    onRemoteCaptionRef.current = onRemoteCaption;
  }, [onRemoteCaption]);

  useEffect(() => {
    userNameRef.current = userName || "Guest";
  }, [userName]);

  useImperativeHandle(ref, () => ({
    sendTranscript: (text, label, confidence) => {
      const payload = buildCaptionPayload(
        text,
        label,
        confidence,
        userNameRef.current,
        sendSeqRef,
      );
      if (!payload.token && !payload.transcript) {
        return;
      }
      if (!roomJoinedRef.current || !deliverCaptionRef.current) {
        pendingCaptionsRef.current.push(payload);
        return;
      }
      deliverCaptionRef.current(payload);
    },
  }));

  useEffect(() => {
    const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
    const containerElement = containerRef.current;

    if (!containerElement || !appID || !serverSecret) {
      console.error("Missing ZEGO config");
      return undefined;
    }

    roomJoinedRef.current = false;
    remoteUserIdsRef.current = new Set();
    pendingCaptionsRef.current = [];

    const userID = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localUserIdRef.current = userID;
    const finalUserName = userName || "Guest";

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      finalUserName,
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zegoRef.current = zp;

    try {
      zp.addPlugins({ ZIM });
    } catch (pluginError) {
      console.warn("ZIM plugin registration failed:", pluginError);
    }

    const emitRemoteCaption = (fromUser, payload) => {
      const senderId = fromUser?.userID || fromUser?.userId;
      if (!senderId || senderId === localUserIdRef.current) {
        return;
      }
      if (!payload || payload.type !== SIGNBRIDGE_CMD) {
        return;
      }

      const transcript =
        payload.transcript != null
          ? String(payload.transcript)
          : payload.token != null
            ? String(payload.token)
            : payload.label != null
              ? String(payload.label)
              : "";
      if (!transcript.trim()) {
        return;
      }

      onRemoteCaptionRef.current?.({
        fromUserId: senderId,
        fromUserName: fromUser?.userName || payload.fromUserName || "Guest",
        transcript,
        label: payload.label != null ? String(payload.label) : "",
        confidence: typeof payload.confidence === "number" ? payload.confidence : 0,
        at: Date.now(),
      });
    };

    deliverCaptionRef.current = (payload) => {
      const instance = zegoRef.current;
      if (!instance) {
        return;
      }

      const jsonPayload = JSON.stringify(payload);
      const remoteIds = Array.from(remoteUserIdsRef.current).filter(
        (id) => id && id !== localUserIdRef.current,
      );

      if (typeof instance.sendInRoomCustomCommand === "function") {
        void instance
          .sendInRoomCustomCommand(payload)
          .catch((error) => console.warn("sendInRoomCustomCommand failed:", error));
      }

      if (typeof instance.sendInRoomCommand === "function" && remoteIds.length) {
        void instance
          .sendInRoomCommand(jsonPayload, remoteIds)
          .catch((error) => console.warn("sendInRoomCommand failed:", error));
      }
    };

    const flushPendingCaptions = () => {
      if (!roomJoinedRef.current || !deliverCaptionRef.current) {
        return;
      }
      const queue = pendingCaptionsRef.current.splice(0);
      for (const payload of queue) {
        deliverCaptionRef.current(payload);
      }
    };

    zp.joinRoom({
      container: containerElement,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
        config: {
          role: ZegoUIKitPrebuilt.Host,
        },
      },
      showPreJoinView: false,
      layout: "Grid",
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
      sendMessageChannel: "ZIM",
      onJoinRoom: () => {
        roomJoinedRef.current = true;
        flushPendingCaptions();
      },
      onUserJoin: (users) => {
        for (const user of users || []) {
          if (user?.userID && user.userID !== localUserIdRef.current) {
            remoteUserIdsRef.current.add(user.userID);
          }
        }
      },
      onUserLeave: (users) => {
        for (const user of users || []) {
          if (user?.userID) {
            remoteUserIdsRef.current.delete(user.userID);
          }
        }
      },
      onInRoomCustomCommandReceived: (commands) => {
        if (!Array.isArray(commands) || !commands.length) {
          return;
        }
        for (const cmd of commands) {
          const payload = cmd?.command;
          const fromUser = cmd?.fromUser || {
            userID: cmd?.senderUserID,
            userName: payload?.fromUserName,
          };
          emitRemoteCaption(fromUser, payload);
        }
      },
      onInRoomCommandReceived: (fromUser, command) => {
        try {
          const payload = JSON.parse(command);
          emitRemoteCaption(fromUser, payload);
        } catch {
          /* ignore malformed commands */
        }
      },
    });

    return () => {
      roomJoinedRef.current = false;
      deliverCaptionRef.current = null;
      remoteUserIdsRef.current = new Set();
      pendingCaptionsRef.current = [];
      try {
        zp.destroy();
      } catch (err) {
        console.warn("Zego destroy failed:", err);
        if (containerElement) {
          containerElement.innerHTML = "";
        }
      }
      zegoRef.current = null;
    };
  }, [roomID, userName]);

  return (
    <div className="video-stage">
      <div ref={containerRef} className="video-stage__canvas" />
    </div>
  );
});

VideoCall.displayName = "VideoCall";

export default VideoCall;
