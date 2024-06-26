import { useState, useEffect, useRef } from "react";
import { RiArrowDropDownLine, RiCloseLine } from "react-icons/ri";
import { TiMessages } from "react-icons/ti";
import { BsFillFileEarmarkArrowDownFill } from "react-icons/bs";
import {RotatingLines } from "react-loader-spinner";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";



export default function AppoinmentCard({appointment}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate()
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMessagesClick = async () => {
    if (user) {
      try {
        const q = query(
          collection(db, "messageRooms"),
          where("users", "array-contains", user)
        );
        const snapshot = await getDocs(q);
        let room = null;
        
        snapshot.forEach((doc) => {
          if (doc.data().users.includes(appointment.doctorId)) {
            room = doc;
          }
        });

        if (room) {
          navigate(`/Message/${room.id}`);
        } else {
          const newRoom = await addDoc(collection(db, "messageRooms"), {
            users: [user, appointment.doctorId ],
            createdAt: new Date(),
          });
          navigate(`/Message/${newRoom.id}`);
        }
      } catch (error) {
        console.error("Error handling messages click: ", error);
      }
    }
  };

  return (
    <>
      
          {/* the appointment card */}
       
          
          <div className="div flex flex-col "  onClick={() => setIsModalOpen(!isModalOpen)}>
           <div className="div flex flex-col gap-[20px] justify-between w-[150px] bg-white  shadow-md rounded-[10px] p-[10px]  relative">
           <div className="img w-full flex justify-center">
              <span className="w-[50px] h-[50px] m-auto">
              <img src="https://picsum.photos/200/300" className="w-full h-full rounded-full" alt=" loading" loading="lazy" />
              </span>
            </div>
            <div className="details">
              <div className="dropdowm flex justify-end w-[max-content] absolute top-0 right-0">
                <span
                  className="w-[max-content] rouned-full p-2 focus:bg-bluegreen"
                  onClick={() => setIsModalOpen(!isModalOpen)}
                >
                  <RiArrowDropDownLine className="fill-greytextdark" style={{fontSize:'30px'}}/>
                </span>
              </div>
              <div className=" text-center ">
                <h1 className=" name break-words text-greytextdark text-[17px]">
                  {appointment.name}
                </h1>
                <p className="mode text-greytextfade text-[15px]"> {appointment.mode}</p>
              </div>
            </div>
           </div>
            {/* the full details of the appointment */}
            {isModalOpen && (
              <div className="absolute  top-0 p left-0 w-full z-[1000] h-full bg-black bg-opacity-50 flex justify-center items-center overflow-x-hidden overflow-y-auto">
                <div
                  className="div modal bg-white h-[80%] overflow-y-auto max-w-sm m-5 mt-10 px-10 pb-10 rounded-lg md:max-w-md w-full  shadow-md relative"
                  ref={modalRef}
                >
                  <div className="div flex justify-end sticky top-0 bg-white py-5">
                  <button
                    className=" text-gray-600 w-[max-content]"
                    onClick={() => {
                      setIsModalOpen(false)
                    }}
                  >
                    <RiCloseLine className="h-6 w-6" />
                  </button>
                  </div>
                  <div className="div">
                            <h1 className="text-[20px] text-greytextdark">Appointment details</h1>
                            <div className="div">
                                <div className="div">
                                    <p className="text-[17px] text-greytext">Date</p>
                                    <p className="text-[15px] text-greytextdark">{appointment.date}</p>
                                </div>
                                <div className="div">
                                    <p className="text-[17px] text-greytext">Time</p>
                                    <p className="text-[15px] text-greytextdark">{appointment.time}</p>
                                </div>
                                <div className="div">
                                    <p className="text-[17px] text-greytext ">Mode</p>
                                    <p className="text-[15px] text-greytextdark">{appointment.mode}</p>
                                </div>
                                <div className="div">
                                    <p className="text-[17px] text-greytext ">Appointment ID</p>
                                    <p className="text-[15px] text-greytextdark">qjr29ur298wnefh23r</p>
                                </div>
                                <div className="div">
                                    <p className="text-[17px] text-greytext">Appoinment link</p>
                                    <a href={appointment.link} className="text-[15px] text-blue break-words">
                                       {appointment.link}
                                    </a>
                                </div>
                                <div className="div">
                                    <p className="text-[17px] text-greytext ">Doctor</p>
                                    <p className="text-[15px] text-greytextdark">Dr { appointment.name}</p>
                                </div>
                                <div className="div">
                                    <p className="text-[17px] text-greytext ">Location</p>
                                    <p className="text-[15px] text-greytextdark">Kampala, Case hispital</p>
                                </div>
                                <div className="div">
                                    <p className="text-[17px] text-greytext">Description</p>
                                    <p className="text-[15px] text-greytextdark breakwords h-[max-content] max-h-[400px] overflow-x-hidden overflow-y-auto">{ appointment.description || 'None specified'}</p>
                                </div>
                                <div className="div flex gap-[30px] justify-start pt-10">
                                            <span>
                                            <TiMessages className="fill-greytextdark" style={{fontSize:'25px'}} onClick={handleMessagesClick}/>
                                            </span>  
                                            <span>
                                            <BsFillFileEarmarkArrowDownFill className="fill-greytextdark" style={{fontSize:'25px'}}/>
                                            </span>                                      
                                </div>
                            </div>
                        </div>
                 
                </div>
              </div>
            )}
          </div>
       
        
     
    </>
  );
}
