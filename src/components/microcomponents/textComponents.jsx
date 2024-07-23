import { Link } from "react-router-dom"
import { IoIosSearch } from "react-icons/io"
import {FaTrash } from "react-icons/fa";
import { useState } from "react";
import { CgFormatSlash } from "react-icons/cg";
import { FiEdit } from "react-icons/fi";

export function Alt(props){
    return(
        <>
         <Link to={props.link} onClick={props.onclick} className="m-auto p-0 text-center w-[200px] ">
            <p className="flex flex-row gap-[5px] justify-center text-center p-3 w-[200px] m-auto">
                <span className="text-blue text-center text-[15px]">{props.highlightText}</span>
                <span className="text-greytestdark text -center text-[15px]">{props.endText}</span>
            </p>
         </Link>
        </>
    )
}

export const styles=' lg:bg-white lg:shadow-xl lg:rounded-[20px] lg:p-[50px] lg:w-[500px] lg:h-[max-content] lg:m-auto '
export const buttonStyle='w-[300px] m-auto pt-[20px] md:w-[100%]'




export function Input(props) {
    return (
        <div className="div flex flex-col gap-2 w-[300px] m-auto pt-[20px] md:w-[100%] max-w-[450px]">
            <label htmlFor={props.for} className="text-[15px] text-greytextdark text-left pl-3">{props.label}</label>
            <input 
                type={props.type} 
                placeholder={props.placeholder} 
                id={props.ids} 
                value={props.value} 
                name={props.name} 
                className={`${props.classes} rounded-[10px] p-3 shadow-md w-[100%] text-left`} 
                onChange={props.onChange}
            />
        </div>
    );
}

export function File(props) {
    return (
        <div className="flex flex-col gap-2 w-[300px] m-auto pt-[20px] md:w-[100%] max-w-[450px]">
            <label htmlFor={props.for} className="text-[15px] text-greytextdark text-left pl-3">
                {props.label}
            </label>
            <input
                type={props.type}
                id={props.ids}
                multiple
                name={props.name}
                className={`${props.classes} rounded-[10px]   w-[100%]`}
                onChange={props.onChange}
            />
        </div>
    );
}

export function Search(props) {
    return(
        <>
        <div className="flex flex-row w-[80%] m-auto  bg-white shadow-lg shadow-smoke rounded-[10px] ">
        <button className=" rounded-[10px] p-2 text-white  w-[30px]"><IoIosSearch className="fill-greytextdark " style={{fontSize:'25px'}}/></button>
            <input 
                type={props.type} 
                placeholder={props.placeholder} 
                id={props.ids} 
                value={props.value} 
                name={props.name} 
                className={`${props.classes} rounded-[10px] p-3  w-full border-0 text-left text-[15px] `} 
                onChange={props.onChange}
            />
            
        </div>
        </>
    )
}

// textarea
export function TextArea(props) {
  return (
    <div className="flex flex-col gap-2 w-[90%] m-auto pt-[20px]">
      <label htmlFor={props.for} className="text-[15px] text-greytextdark text-left pl-3">
        {props.label}
      </label>
      <textarea
        type={props.type}
        placeholder={props.placeholder}
        id={props.ids}
        name={props.name}
        className={`${props.classes} rounded-[10px] p-3 shadow-lg w-[100%] h-[250px]`}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
}


export function FilePicker({ onFileChange }) {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    onFileChange(selectedFile)
    // Check file type (image or video)
    const fileType = selectedFile.type.split('/')[0];
    if (fileType !== 'image') {
      alert('Please select an image orfile.');
      return;
    }
    // Add file to the list
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
        <FiEdit lassName="text-lg" />
        <span>{'Select File'}</span>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={(e)=>handleFileChange(e)}
          className="hidden"
        />
      </label>
      <div className="mt-4 flex flex-wrap md:flex-nowrap overflow-x-auto p-4">
        {files.map((file, index) => (
          <div key={index} className="relative w-full md:w-80 h-80 md:h-96 m-2 border rounded-[20px] overflow-hidden flex-shrink-0">
            {file.type.startsWith('image') ? (
              <img src={URL.createObjectURL(file)} alt={`Image ${index}`} className="w-full h-full object-cover rounded-[20px]" />
            ) :''}
            <button
              onClick={(event) => handleRemoveFile(event, index)}
              className="absolute top-2 right-2 text-white bg-red-600 rounded-full p-1 hover:bg-red-800"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


export function Loading(){
  return(
    <>
                  <div className="loading-indicator w-[100px] h-auto  m-auto mt-[10%]  p-2 md:mt-[20%]">
                  <img src="/images/load-35_128.gif" alt="Loading..." />
                  </div>
    </>
  )
  }

export function ProfileImage(props) {
  const [files, setFiles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Check file type (image)
    const fileType = selectedFile.type.split('/')[0];
    if (fileType !== 'image') return;

    // Add file to the list and show popup
    const updatedFiles = [selectedFile];
    setFiles(updatedFiles);
    setShowPopup(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Implement your form submission logic here
    setShowPopup(false); // Hide the popup on form submission
  };

  const handleCancel = () => {
    setFiles([]);
    setShowPopup(false);
  };

  const handleOutsideClick = (event) => {
    if (event.target.id === 'popup-overlay') {
      handleCancel();
    }
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="w-[max-content]relative w-[max-content] -z-50">
        <label htmlFor="fileInput" className="cursor-pointer flex items-center space-x-2 w-[max-content]">
          <FiEdit className="text-lg" />
        
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {showPopup && (
          <div
            id="popup-overlay"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleOutsideClick}
          >
            <div className="bg-white shadow-lg rounded-lg p-4 -z-50 relative w-11/12 sm:w-9/12 md:w-7/12 lg:w-1/2 xl:w-2/5">
              {files.map((file, index) => (
                <div key={index} className="w-full mb-4 max-h-[50vh] overflow-hidden flex justify-center items-center">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Image ${index}`}
                    className="max-h-full rounded-lg object-contain"
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}


export function Date(props){
  return(
    <>
    <div className="div w-full m-auto text-left">
    <label htmlFor={props.for} className="text-[15px] text-greytextdark text-left pl-3">
                {props.label}
            </label>
    </div>
    <div className="div w-full flex flex-row justify-between gap-[10px] mt-5" >
    <span className="w-full p-3 shadow-md rounded-[10px]">
    <select name="" id="" className="  rounded-[10px] outline-none w-full bg-white text-center cursor-pointer ">
     {props.days?props.days.map((day,index)=>(<option key={index} value={day.day}>{day.day}</option>)):<option>NULL</option>}
    </select>
    </span>
    <span className="p-3">
      <CgFormatSlash className="fill-greytextdark" style={{fontSize:'30px'}}/>
    </span>
    <div className="div p-3 shadow-md rounded-[10px] w-full cursor-not-allowed">
      {<p className="text-[15px] text-center text-greytextdark">{props.month?props.month:'NULL'}</p>}
    </div>
    <span className="p-3">
    <CgFormatSlash className="fill-greytextfade" style={{fontSize:'35px'}}/>
    </span>
    <div className="div p-3 shadow-md rounded-[10px] w-full cursor-not-allowed">
    {<p className="text-[15px] text-center text-greytextdark">{props.year?props.year:'NULL'}</p>}
    </div>
    </div>
    </>
  )
}

export function Select(props) {
  return (
    <div className="div mt-5 w-full">
      <label htmlFor={props.for} className="text-[15px] text-greytextdark text-left mb-3">
        {props.label}
      </label>
      <div className="div p-3 shadow-md rounded-[10px]">
        <select
          name=""
          value={props.valu}
          id=""
          className="rounded-[10px] outline-none w-full bg-white text-center cursor-pointer"
          onChange={props.onChange}
        >
          {props.options ? props.options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          )) : null}
        </select>
      </div>
    </div>
  );
}

export function Nodata(props){
  return(
    <>
      <div className="div w-full m-auto text-center mt-[40%] xl:mt-[10%] ">
        <div className="img w-[50%] h-[400px] m-auto mt-[100px] opacity-30">
          <img src="/images/post.jpg" alt="loading" loading="lazy" />
        </div>
        <p className="text-greytextdark text-center text-[15px]">{props.text}</p>
      </div>
    </>
  )
}