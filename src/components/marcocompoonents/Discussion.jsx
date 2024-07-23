import React, { useEffect, useRef, useState } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where, getDocs } from 'firebase/firestore';
import HeadWithBack from '../microcomponents/HeadWithBack';
import { IoSend } from "react-icons/io5";
import { db } from '../../firebase/config';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const classes = {
  mother: 'rounded-l-[10px] rounded-b-[10px] w-[max-content] max-w-[80%] bg-smoke text-black my-[3px]',
  doctor: 'rounded-r-[10px] rounded-b-[10px] w-[max-content] max-w-[80%] bg-blue text-white my-[3px]',
  doctorPosition: 'flex items-start',
  motherPosition: 'flex items-start justify-end'
};

function MessageHolder({ message }) {
  const formatTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className={message.sender === 'doctor' ? classes.doctorPosition : classes.motherPosition}>
      <div className={message.sender === 'doctor' ? classes.doctor : classes.mother}>
        <p className='px-3 pt-3 text-left text-[16px] break-words'>{message.text}</p>
        <div className="time">
          <p className="text-right p-2 text-[12px]">{message.timestamp ? formatTimestamp(message.timestamp) : 'Loading...'}</p>
        </div>
      </div>
    </div>
  );
}

export default function Discussion() {
  const { id: roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userType, setUserType] = useState(null);
  const inputRef = useRef(null);
  const messageEndRef = useRef(null);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    inputRef.current.focus();


    const determineUserType = async () => {
      if (user) {
        try {
          const uid = user;
    
          // Check if the user is an admin
          const adminQuery = query(collection(db, 'admin'), where('uid', '==', uid));
          const adminSnapshot = await getDocs(adminQuery);
    
          if (!adminSnapshot.empty) {
            setUserType('admin');
            return;
          }
    
          // Check if the user is a doctor
          const doctorQuery = query(collection(db, 'doctors'), where('uid', '==', uid));
          const doctorSnapshot = await getDocs(doctorQuery);
    
          if (!doctorSnapshot.empty) {
            setUserType('doctor');
            return;
          }
    
          // Check if the user is a mother
          const motherQuery = query(collection(db, 'mothers'), where('uid', '==', uid));
          const motherSnapshot = await getDocs(motherQuery);
    
          if (!motherSnapshot.empty) {
            setUserType('mother');
            return;
          }
    
          // If no user type is found
          console.error("User type not found.");
        } catch (error) {
          console.error("Error determining user type:", error.message);
        }
      } else {
        console.error("User is not logged in.");
      }
    };
    
    determineUserType();

    if (roomId) {
      const q = query(collection(db, "messages"), where('roomId', '==', roomId), orderBy("timestamp"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const msgs = [];
        querySnapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() });
        });
        setMessages(msgs);
      }, (error) => {
        console.error("Error fetching messages:", error.message);
      });

      return () => unsubscribe();
    }
  }, [user, roomId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && userType) {
      try {
        await addDoc(collection(db, "messages"), {
          sender: userType,
          text: newMessage,
          timestamp: serverTimestamp(),
          roomId
        });
        setNewMessage('');
        inputRef.current.focus();
      } catch (error) {
        console.error("Error sending message:", error.message);
      }
    } else {
      console.warn("Message is empty or userType is not set.");
    }
  };

  return (
    <>
      <HeadWithBack heading={messages.map((msg)=>(msg.id))} />
      <div className="div w-full  h-full flex justify-between md:relative md:h-[95%] overflow-x-hidden">
        <div className="message p-5 h-full w-full overflow-y-auto pb-[100px] md:pb-[120px]"> {/* Add padding-bottom here */}
          {messages.map((msg) => (
            <MessageHolder key={msg.id} message={msg} />
          ))}
          <div ref={messageEndRef}></div>
        </div>
        <form onSubmit={sendMessage} className="input flex gap-x-[10px] w-full bg-gray-200 p-2 absolute bottom-0 md:absolute md:h-[100px] ">
          <input
            type="text"
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full h-[45px] rounded-[10px] px-2 outline-0"
            placeholder="Type your message here..."
          />
          <button type="submit" className="flex items-center justify-center w-[45px] h-[45px] rounded-[10px] bg-blue-500">
            <IoSend className="fill-blue" style={{ fontSize: '24px' }} />
          </button>
        </form>
      </div>
    </>
  );
}
