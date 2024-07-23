import  { useEffect, useState } from "react";

import {Doctor} from "../microcomponents/DoctorListcard";
import HeadWithBack from "../microcomponents/HeadWithBack";
import { Search } from "../microcomponents/textComponents";
import AdminUserSingle from "../microcomponents/AdminUserSingle";
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "firebase/auth";


export default function  AdminDoctors() {
  const user = useSelector((state) => state.auth.user);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/User/sign-in');
        return;
      }

      const adminRef = collection(db, "admin");
      const q = query(adminRef, where("uid", "==", user));

      try {
        const adminSnapshot = await getDocs(q);
        if (adminSnapshot.empty) {
          navigate('/User/sign-in');
          return;
        }

        fetchDoctors();
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate('/User/sign-in');
      }
    };

    const fetchDoctors = async () => {
      const doctorsRef = collection(db, "doctors");
    
      try {
        const doctorSnapshot = await getDocs(doctorsRef);
        const doctorsData = doctorSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp ? data.timestamp.toDate().toLocaleString() : null,
          };
        });
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    checkAdmin();
  }, [user, navigate]);

  const handleDelete = async (doctorId) => {
    try {
      await deleteDoc(doc(db, "doctors", doctorId));
      await deleteUser(auth, doctorId);
      setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.id !== doctorId));
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };



  const handleStatusChange = async (doctorId) => {
    try {
      const doctorRef = doc(db, "doctors", doctorId);
      const doctorSnap = await getDoc(doctorRef);
      const currentStatus = doctorSnap.data().isActive;
      await updateDoc(doctorRef, { isActive: !currentStatus });
      setDoctors((prevDoctors) =>
        prevDoctors.map((doctor) =>
          doctor.id === doctorId ? { ...doctor, isActive: !currentStatus } : doctor
        )
      );
    } catch (error) {
      console.error("Error updating doctor status:", error);
    }
  };
  return (
    <>
      <div className="div">
        <HeadWithBack heading='Doctors'/>
        <div className="div">
          <div className="div p-3 h-auto">
            <Search
              type="text"
              placeholder="Search a pediatrician"
              ids="search"
              classes="rounded-[10px] p-3 w-full border-0 text-left text-[15px] outline-none"
            />
          </div>
          <div className="div w-[90%] m-auto flex flex-wrap justify-between gap-[10px] pt-5">
          {doctors.map((doctor) => (
             <AdminUserSingle 
             //  the use type group must be retuned please to handle ui logic please isaac

             key={doctor.id}
             user={'mother'}
             name={doctor.firstName + " " + doctor.secondName} 
             time={doctor.timestamp || "21/03/2024"}
             email={doctor.email}
             doctorId={doctor.uid}
            // this deactives an account 
            status={doctor.isActive ? "Activated" : "Deactivated"}
            //  the shows after the doctor has created it
             Description={ doctor.bio || 'Am a doctor the treates people well'}
             show={true}
             downloadFile={doctor.licenseURL}
             downloadCertificate={doctor.certificateURL}
            //  this initlizes a message between mother and admin
             handleMassageClick={console.log('message init')}
            //  the delete the mother form the platform
            onChangeCheck={() => handleStatusChange(doctor.id)}
              handleDelete={() => handleDelete(doctor.id)}
             />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
