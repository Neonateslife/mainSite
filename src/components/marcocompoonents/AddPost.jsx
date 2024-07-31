import React, { useEffect, useState } from "react";
import HeadWithBack from "../microcomponents/HeadWithBack";
import { TextArea } from "../microcomponents/textComponents";
import { createPost } from "../../firebase/post";
import RoundedButton from "../microcomponents/RoundedButton";
import { useSelector } from "react-redux";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

export default function AddPost() {
  const userUid = useSelector((state) => state.auth.user);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const user = useSelector(state => state.auth.user);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();
  const [loading,setLoading]= useState(false)
  useEffect(() => {
    const determineUserType = async () => {
      if (user) {
        try {
          console.log("User ID: ", user);
          const uid = user;

          const doctorQuery = query(collection(db, 'doctors'), where('uid', '==', uid));
          const doctorSnapshot = await getDocs(doctorQuery);

          if (!doctorSnapshot.empty) {
            setUserType('doctor');
            console.log("User is a doctor");
            return;
          }

          const motherQuery = query(collection(db, 'mothers'), where('uid', '==', uid));
          const motherSnapshot = await getDocs(motherQuery);

          if (!motherSnapshot.empty) {
            setUserType('mother');
            console.log("User is a mother");
          }
        } catch (error) {
          console.error("Error determining user type: ", error);
        }
      } else {
        navigate('/User/sign-in');
        console.log("No user found");
      }
    };

    determineUserType();
  }, [user, navigate]);

  const handleFileChange = (files) => {
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("user uid is " + userUid);
    setLoading(true)
    try {
      
      await createPost(userUid, content, selectedFiles,userType);
      alert("Post created successfully!");
      setContent("");
      setSelectedFiles([]);
      navigate('/');
      setLoading(false)
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    }
  };

  return (
    <>
      <div className="post w-full h-full overflow-y-auto pb-[10px]">
        <HeadWithBack heading="Add Post" />
        <div className="div w-full">
          <form className="form" onSubmit={handleSubmit}>
            <TextArea
              placeholder="Write your post here"
              ids="post"
              classes="rounded-[10px] p-3 shadow-md w-full border-0 text-left text-[15px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <FilePicker onFileChange={handleFileChange} />
          <div className="div w-[200px] m-auto
          ">
            { !loading &&
          <RoundedButton onClick={handleSubmit} text={loading ? "Posting..." : "Post"} disabled={loading} />}
          </div>
          </form>
        </div>
      </div>
    </>
  );
}

export function FilePicker({ onFileChange }) {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileType = selectedFile.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'video') {
      alert('Please select an image or video file.');
      return;
    }

    const updatedFiles = [...files, selectedFile];
    setFiles(updatedFiles);
    onFileChange(updatedFiles);
  };

  const handleRemoveFile = (event, index) => {
    event.preventDefault();
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFileChange(updatedFiles);
  };

  return (
    <div className="p-4">
      <label htmlFor="fileInput" className="cursor-pointer border-solid border-[1px] border-greytextfade rounded-full p-2">
        <span>{files.length === 0 ? 'Select File' : 'Add Another File'}</span>
        <input
          type="file"
          id="fileInput"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <div className="mt-4 flex flex-wrap md:flex-nowrap overflow-x-auto p-4">
        {files.map((file, index) => (
          <div key={index} className="relative w-full md:w-80 h-80 md:h-96 m-2 border rounded-[20px] overflow-hidden flex-shrink-0">
            {file.type.startsWith('image') ? (
              <img src={URL.createObjectURL(file)} alt={`Image ${index}`} className="w-full h-full object-cover rounded-[20px]" />
            ) : (
              <video controls src={URL.createObjectURL(file)} className="w-[contain] h-full object-cover rounded-[20px]" />
            )}
            <button
              onClick={(event) => handleRemoveFile(event, index)}
              className="absolute top-2 right-2 text-white bg-red-600 rounded-full p-1 hover:bg-red-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
