import React, { useContext, useState, useRef, useEffect } from "react";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import Smile from "../img/smile.png";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import "emoji-mart/css/emoji-mart.css";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Picker } from "emoji-mart";

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const emojisRef = useRef(null);
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    if (img) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, img);

      uploadTask.on(
        (error) => {
          //TODO:Handle Error
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    setText("");
    setImg(null);
  };
  const handleEmojiClick = () => {
    setShowEmojis(!showEmojis);
  };

  const handleEmojiSelect = (emoji) => {
    setText(text + emoji.native);
    setShowEmojis(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojisRef.current && !emojisRef.current.contains(event.target)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.keyCode === 13) {
            handleSend();
          }
        }}
        value={text}
      />

      <div className="send">
        <img src={Attach} alt="" />
        <input
          type="file"
          style={{ display: "none" }}
          id="file"
          onChange={(e) => setImg(e.target.files[0])}
        />
        <label htmlFor="file">
          <img src={Img} alt="" />
        </label>

        <div onClick={handleEmojiClick}>
          <img src={Smile} alt="Emoji" />
        </div>
        <button onClick={handleSend}>Send</button>
      </div>
      {showEmojis && (
        <div className="emojis" ref={emojisRef}>
          <Picker
            onSelect={handleEmojiSelect}
            title="Pick your emoji…"
            emoji="point_up"
            style={{
              position: "absolute",
              bottom: "130px",
              right: "20px",
              zIndex: 1,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Input;
