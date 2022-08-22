import React, {useState, useEffect, useRef} from "react";
import FormData from 'form-data';
import {useRouter} from 'next/router';
import * as controller from '../../controllers';
import toast , { Toaster } from 'react-hot-toast';

export default function Settings() {
  const [path, setPath] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [imgSrc, setImgSrc] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [connected, isConnected] = useState(false);
  const [saved, isSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSelected, setShowSelected] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showModalTag, setShowModalTag] = useState(false);
  const [imageShow, setImageShow] = useState('');
  const [storeHash, setStoreHash] = useState('');
  const [imageList, setImageList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [tags, setTags] = useState([]);

  const router = useRouter();

  // load callback
  useEffect(() => {
    if(router.query.auth){
      setIsLoading(true);
      controller.bulkImageAuthController.verifyPayload(router.query.auth)
        .then((response) => {
          const loginExpiration = Date.now() + 3600000;
          const { email, accountId, context, webDav } = response.data.data;
          controller.bulkImageSessionController.create({email, accountId,loginExpiration, context, webDav});
          const pathUrl = context.url + '/dav';

          setPath(pathUrl);
          setStoreHash(context.storeHash);
          setPassword(context.webDav.password);
          setUsername(email);
          
          if(context.webDav.password && context.webDav.username && context.webDav.path){

            const webDavCredentials = {
              path: pathUrl,
              username: context.webDav.username,
              password: context.webDav.password
            }

            controller.webDavController.connect(webDavCredentials)
            .then((response) => {
              if(response){
                isConnected(true);
                isSaved(true);
                setIsLoading(false);
                SuccessMessage('WebDav now connected!');
              }
            })
            .catch((error) => {
              isConnected(false);
              isSaved(false);
              setIsLoading(false);
              ErrorMessage('An error occur while connecting to webdav!') 
            })

          } 

          SuccessMessage('Bulk-Image payload verified!');
          setIsLoading(false);
           
        })
          
      .catch((error) => {
        ErrorMessage('An error occur loading credentials');
        setIsLoading(false);
      })
  }}, []);

  useEffect(() => {
    const appData = controller.bulkImageSessionController.get();

    if(appData){
      const data = {
        storeHash: appData.context.storeHash,
        token: appData.context.accessToken
      }
      controller.webDavController.getImages(data)
      .then((response) => {
        setImageList(response.data.data);
      })
      .catch((error) => {
      })
    }
    
  }, [isConnected, isSaved])

  const SuccessMessage = (message) =>{
    toast.success(message, {position: 'bottom-right'})
  }

  const ErrorMessage = (message) =>{
    toast.error(message, {position: 'bottom-right'})
  }

  const handleConnectSave = async(e) => {
    e.preventDefault();

    setIsProcessing(true);

    const webDavCredentials = {
      path: path,
      username: username,
      password: password
    }

    if(!connected && !saved){
      controller.webDavController.connect(webDavCredentials)
      .then((response) => {
        if(response){
          isConnected(true);
          setIsProcessing(false);
          SuccessMessage('WebDav now connected!');
        }
      })
      .catch((error) => {
        isConnected(false);
        setIsProcessing(false);
        ErrorMessage('An error occur while connecting to webdav!') 
      })
    } else {
      const appData = controller.bulkImageSessionController.get();
    
      const data = { 
        user: {
          email: appData.email,
          accountId: appData.accountId
        },
        token: appData.context.accessToken,
        appData: {
          webDav: {
            path: path,
            username: username,
            password: password
          }
        }
      };
      controller.webDavController.save(data)
      .then((response) => {
        if(response){
          isSaved(true);
          setIsProcessing(false);
          SuccessMessage('Successfully saved the webdav config!');
        } else {
          setIsProcessing(false);
          ErrorMessage('An error occur while saving config!');
        }
      })
      .catch((error) => {
        setIsProcessing(false);
        isSaved(false);
        ErrorMessage('An error occur while saving config!');
      })
    }

  }

  const handleUpload = async(e) => {
    e.preventDefault();

    setIsUploading(true);
    const appData = controller.bulkImageSessionController.get();
    const formData = new FormData();
    formData.append("path", path);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("token", appData.context.accessToken);

    for(let i =0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
    }

    controller.webDavController.upload(formData)
    .then((response) => {
      if(response){

        if(response){
          const uploaded = response.data.data.uploaded.length;
          const not_uploaded = response.data.data.not_uploaded.length;
          const file_list = response.data.data.files;

          setImageList(file_list);
          if(uploaded) SuccessMessage(uploaded + " file(s) uploaded successfully");
          if(not_uploaded) ErrorMessage(not_uploaded + " file(s) not uploaded. Possible duplicate!") 
        }
      
        setShowSelected(0);
        setIsUploading(false);
      }
    })
    .catch((error) => {
      setIsUploading(false);
    })
    
  }

  const handleFileOnChange = async(e) => {
    setShowSelected(e.target.files.length);
    const array = [];

    Array.from(e.target.files).forEach(file => array.push(file));
    setSelectedFiles(array);
  }

  const handleModalTag = async(item) => {
    setImageShow(item);
    setSearchResults([]);
    setShowModalTag(true);
  }

  const handleSearch = async(e) => {
    e.preventDefault();
    
    setIsProcessing(true);
    const appData = controller.bulkImageSessionController.get();
    const data = {
      token: appData.context.accessToken,
      storeHash: appData.context.storeHash,
      searchParams: e.target.search.value
    }

    controller.webDavController.searchProducts(data)
    .then((response) => {
      if(response){
        setIsProcessing(false);
        const array = [];
        Array.from(response.data.data).forEach(file => array.push(file));
        setSearchResults(array);
      }
    })
    .catch(() => {
      setIsProcessing(false);
    })
  }

  const handleCancelUpload = async() => {
    setShowSelected(0);
    setSelectedFiles([]);
  }

  const handleRemoveImage = async(index) => {
    const array = [];

    Array.from(selectedFiles).forEach(file => array.push(file));
    array.splice(index, 1);
    setShowSelected(array.length);
    setSelectedFiles(array);
  }

  const LazyImage = (imageProps) => {
    const [shouldLoad, setShouldLoad] = useState(false);
    const placeholderRef = useRef(null);
  
    useEffect(() => {
      if (!shouldLoad && placeholderRef.current) {
        const observer = new IntersectionObserver(([{ intersectionRatio }]) => {
          if (intersectionRatio > 0) {
            setShouldLoad(true);
          }
        });
        observer.observe(placeholderRef.current);
        return () => observer.disconnect();
      }
    }, [shouldLoad, placeholderRef]);
  
    return (shouldLoad 
      ? <img {...imageProps}/> 
      : <div className="img-placeholder" ref={placeholderRef}/>
    );
  };

  const handleImageCheck = (event, products) => {
    const data = [];
    
    if(event.target.checked){
      data = {
        prodId: products.id,
        prodName: products.name,
        prodImageUrl: products.custom_url.url
      }
      setTags(tags.concat(data));
    } else {
      const index = tags.findIndex(({prodId}) => prodId == event.target.value);
      console.log(index);
      const array = [];
      if(index !== -1) {
        tags.splice(index, 1);
      }
    }
  }

  const handleSaveTag = () => {
    setIsTagging(true);
    const appData = controller.bulkImageSessionController.get();

    const data = {
      token: appData.context.accessToken,
      filename: imageShow.filename,
      url: imageShow.url,
      tag: tags
    }

    controller.webDavController.tagProducts(data)
    .then((response) => {
      setIsTagging(false);
      SuccessMessage("Products was successfully tagged!")
    })
    .catch((error) => {
      setIsTagging(false);
      ErrorMessage("Error tagging products! Please try again!");
    })
  }

  const handleProductView = (url) => {
    const app = controller.bulkImageSessionController.get();
    window.open(app.context.domain + url, '_blank', 'noopener, noreferrer');
  }

  return (
    <>  
    <Toaster position="top-right" reverseOrder={false} duration="6000"/>
    {isLoading ? 
      <>
      <div id="loading-screen" className="align-center w-full h-full fixed block top-0 left-0 bg-gray-200 opacity-100 z-50">
          <span className="text-blue-500 opacity-75 top-1/2 my-0 mx-auto block relative w-0 h-0">
            <i className="fas fa-circle-notch fa-spin fa-3x"></i>
            <label className="text-sm">Loading..</label>
          </span>
        
      </div> 
      </>
      :
        connected && saved ? 
          <>
            <nav className="bg-white px-2 sm:px-4 py-2.5 dark:bg-gray-900 fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
              <div className="container flex flex-wrap justify-between items-center mx-auto">
                <a href="#" className="flex items-center">
                    <img src="/icons/bulkimage.png" className="mr-3 h-6 sm:h-9" alt="Bulk Image Logo"/>
                </a>
                <div className="flex md:order-2">
                    <button type="button" 
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => setShowModal(true)}>WebDav Credentials</button>
                    <button data-collapse-toggle="navbar-sticky" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-sticky" aria-expanded="false">
                      <span className="sr-only">Open main menu</span>
                      <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                  </button>
                </div>
              </div>
            </nav>

            <div className="bg-gray-400 z-10 h-screen sm:px-8 md:px-16 sm:py-8 mt-10">
              <main className="container mx-auto max-w-screen-lg h-full">
                <form onSubmit={handleUpload} encType="multipart/form-data">
                  <article aria-label="File Upload Modal" className="relative h-full flex flex-col bg-white shadow-xl rounded-md mt-10">

                    <section className="h-full p-8 w-full h-full flex flex-col">
                      <header className="border-dashed border-2 border-gray-400 py-12 flex flex-col justify-center items-center">
                        <p className="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
                          <span>Drag and drop your</span>&nbsp;<span>files anywhere or</span>
                        </p>

                        <label className="w-48 flex flex-col items-center px-4 py-4 bg-white-400 text-black rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-400 hover:text-white">
                          <span className="mt-2 text-base leading-normal">Upload a file</span>
                          <input
                            type='file' 
                            className="hidden" 
                            multiple 
                            id="file_input" 
                            name="file_upload"
                            onChange={handleFileOnChange}/>
                        </label>
                      </header>

                      <h1 className="pt-8 pb-3 font-semibold sm:text-lg text-gray-900">
                        {showSelected ? showSelected + ' file(s) selected' : 'To Upload'} 
                      </h1>

                      <div className="h-48 overflow-auto overflow-x-hidden">
                        <ul id="gallery" className="flex flex-1 flex-wrap -m-1">
                          {showSelected < 1 ? 
                          <li id="empty" className="h-full w-full text-center flex flex-col items-center justify-center items-center">
                            <img className="mx-auto w-32" src="https://user-images.githubusercontent.com/507615/54591670-ac0a0180-4a65-11e9-846c-e55ffce0fe7b.png" alt="no data" />
                            <span className="text-small text-gray-500">No files selected</span>
                          </li>
                          : 
                            selectedFiles.map((item, index) => (
                              <li className="block p-1 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 xl:w-1/8 h-24" key={index}>
                                <article tabIndex="0" className="group hasImage w-full h-full rounded-md focus:outline-none focus:shadow-outline bg-gray-100 cursor-pointer relative text-transparent hover:text-white shadow-sm">
                                  <img alt="upload preview" className="img-preview w-full h-full sticky object-cover rounded-md bg-fixed" src={URL.createObjectURL(item)} />

                                  <section className="flex flex-col rounded-md text-xs break-words w-full h-full z-10 absolute top-0 py-2 px-3">
                                    <h1 className="flex-1"></h1>
                                    <div className="flex">
                                      <span className="p-1">
                                        <i>
                                          <svg className="fill-current w-4 h-4 ml-auto pt-" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                            <path d="M5 8.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5zm9 .5l-2.519 4-2.481-1.96-4 5.96h14l-5-8zm8-4v14h-20v-14h20zm2-2h-24v18h24v-18z" />
                                          </svg>
                                        </i>
                                      </span>

                                      <p className="p-1 size text-xs"></p>
                                      <button type="button" onClick={() => handleRemoveImage(index)} className="delete ml-auto focus:outline-none hover:bg-gray-300 p-1 rounded-md">
                                        <svg className="pointer-events-none fill-current w-4 h-4 ml-auto" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                          <path className="pointer-events-none" d="M3 6l3 18h12l3-18h-18zm19-4v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.316c0 .901.73 2 1.631 2h5.711z" />
                                        </svg>
                                      </button>
                                    </div>
                                  </section>
                                </article>
                              </li>
                            ))
                          
                          }
                        </ul>
                      </div>
                    </section>

                    <footer className="flex justify-end px-8 pb-8 pt-4">
                      <button type="submit" className="flex justify-center rounded-sm px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none">
                      {isUploading ? 
                        <>
                            <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="font-medium">Uploading</span>
                        </>
                        :
                        <span className="font-medium">Upload</span>
                      }
                      
                      </button>
                      <button type="button" onClick={handleCancelUpload} className="ml-3 rounded-sm px-3 py-1 hover:bg-gray-300 focus:shadow-outline focus:outline-none">
                        Cancel
                      </button>
                    </footer>
                  </article>
                </form>
              </main>
            </div>
                
            
            <div className="container mx-auto">
              <main className="container mx-auto max-w-screen-lg h-full">
                <section className="p-8 w-full h-full flex flex-col">
                  {/* <div className="container px-5 py-2 mx-auto lg:pt-12 lg:px-32"> */}
                    <h1 className="pt-8 pb-3 font-semibold sm:text-lg text-gray-900 mb-10">
                      Uploaded Images {imageList && imageList.length}
                    </h1>
                    <div className="flex flex-wrap -m-1 md:-m-2 h-96 overflow-y-scroll">
                    {imageList && imageList.map((item) => (
                      <li className="block p-1 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 xl:w-1/8 h-24" key={item.url}>
                      <article onClick={() => handleModalTag(item)} tabIndex="0" className="group hasImage w-full h-full rounded-md focus:outline-none focus:shadow-outline bg-gray-100 cursor-pointer relative text-transparent hover:text-white shadow-sm">
                        <LazyImage alt="upload preview" className="img-preview w-full h-full sticky object-cover rounded-md bg-fixed" src={item.url} />

                        <section className="flex flex-col rounded-md text-xs break-words w-full h-full z-20 absolute top-0 py-2 px-3">
                          <h1 className="flex-1"></h1>
                          <div className="flex">
                            <span className="p-1">
                              <button type="button">
                                <svg className="fill-current w-4 h-4 ml-auto pt-" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                  <path d="M5 8.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5zm9 .5l-2.519 4-2.481-1.96-4 5.96h14l-5-8zm8-4v14h-20v-14h20zm2-2h-24v18h24v-18z" />
                                </svg>
                              </button>
                            </span>

                            <p className="p-1 size text-xs"></p>
                            {/* <button className="delete ml-auto focus:outline-none hover:bg-gray-300 p-1 rounded-md">
                              <svg className="pointer-events-none fill-current w-4 h-4 ml-auto" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path className="pointer-events-none" d="M3 6l3 18h12l3-18h-18zm19-4v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.316c0 .901.73 2 1.631 2h5.711z" />
                              </svg>
                            </button> */}
                          </div>
                        </section>
                      </article>
                    </li>
                    ))}
                    </div>
                  {/* </div> */}
                </section>
              </main>
            </div>   
            {showModal ? (
              <div id="webdav-modal" tabIndex="-1" className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full justify-center items-center flex" aria-modal="true" role="dialog">
                    <div className="relative p-4 w-full max-w-md h-full md:h-auto">
                        <div className="relative bg-gray-400 rounded-lg shadow dark:bg-gray-700">
                            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" onClick={() => setShowModal(false)}>
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                            <div className="py-6 px-6 lg:px-8">
                                <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">WebDav File Access</h3>
                                <form className="space-y-6" action="#">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Path</label>
                                        <input type="text" name="path" id="path" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="" value={path}/>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Username</label>
                                        <input type="text" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" value ={username} placeholder="" />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Password</label>
                                        <input type="text" name="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" value={password} placeholder="" />
                                    </div>
                                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => setShowModal(false)}>Close</button>
                                </form>
                            </div>
                        </div>
                    </div>
              </div> 
            ) : null}

          {showModalTag ? (
            
            <div id="modal"
                className="fixed top-0 left-0 z-[100] w-screen h-screen bg-black/70 overflow-auto">
                
                <a className="fixed z-80 top-10 right-8 text-white text-3xl font-bold" href="#"
                    onClick={() => setShowModalTag(false)}>&times;</a>
                
                <main className="container mx-auto max-w-screen-lg">
                {/* <form onSubmit={handleUpload} encType="multipart/form-data"> */}
                  <article aria-label="File Upload Modal" className="relative h-full flex flex-col bg-white shadow-xl rounded-md mt-10">

                    <section className="h-full p-8 w-full h-full">
                        <h2 className="font-bold">Product Tagging</h2>
                      <div className="flex flex-row">
                        <header className="py-12 w-5/12 flex flex-col">
                          <div className="relative w-full">
                            <img src={imageShow.url} />
                            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gray-800 opacity-70">
                                <h3 className="text-md text-white font-bold">
                                    {imageShow.filename}</h3>
                                <p className="mt-2 text-sm text-gray-300">{imageShow.url}</p>
                            </div>
                          </div>
                          <p className="mt-5 font-semibold">Tags</p> 
                          {/* {imageShow.tag && imageShow.tag.map((item) => (
                            <div className="">
                              {item.prodName}
                            </div>
                          ))} */}
                          <div className="flex flex-col">
                          {imageShow.tag.length > 0 && imageShow.tag.map((item) => (
                              <span className="text-sm text-base" key={item.prodId}>#{item.prodId} #{item.prodName} #{item.prodImageUrl}</span>
                          ))}
                          </div>
                        </header>

                        <div className="md:ml-10 md:mt-10 w-7/12 h-auto">
                          <form onSubmit={handleSearch}>   
                            <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">Your Email</label>
                            <p className="mb-5 text-base font-bold text-gray">Search keyword and tag your image to a products here</p>
                            <div className="relative">
                                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                    <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <input type="text" name="search" className="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required/>
                                <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                            </div>
                          </form>
                          {isProcessing ? 
                             <div className="flex flex-wrap mt-10 h-90">
                              <span className="text-blue-500 opacity-75 top-1/2 my-0 mx-auto block relative w-0 h-0">
                                <i className="fas fa-circle-notch fa-spin fa-3x"></i>
                                <label className="text-sm">Loading...</label>
                              </span>
                            </div>  
                            : 
                            <>
                            
                            <p className="mt-5 text-base font-semibold text-gray">{searchResults && searchResults.length > 0 ? searchResults.length + ' result(s) found.' : ''}</p>
                            <div className="flex flex-wrap mt-10 h-90">
                              {searchResults ? 
                                searchResults.map((item) => ( 
                                  <label className="w-5/12 m-2" key={item.products.id}>
                                    <input onChange={(event) => handleImageCheck(event, item.products)} type="checkbox" name="image" value={item.products.id}/>
                                    <div>
                                      <div className="w-full max-w-sm bg-white rounded-lg hover:bg-blue-200 shadow-md dark:bg-gray-800 dark:border-gray-700 p-4" tabIndex="0" >
                                        {/* <a href="#">
                                        <img className="object-cover w-full h-96 rounded-md md:h-auto md:w-48" src={item.images.data[0].url_thumbnail} alt=""/>
                                        </a> */}
                                        <div className="relative w-full">
                                          <img src={item.images.data[0].url_thumbnail} />
                                          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gray-800 opacity-70">
                                              <h3 className="text-sm text-white font-bold">
                                              {item.products.name}</h3>
                                              <p className="mt-2 text-sm text-gray-300">SKU: {item.products.sku}</p>
                                          </div>
                                        </div>

                                        <div className="mt-2 justify-center items-center content-center">
                                          <button onClick={() => handleProductView(item.products.custom_url.url)} className="flex w-full  justify-center rounded-sm px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none">
                                            View Product 
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                ))
                              : ''
                              }
                              
                            </div>
                            </>
                          }
                        </div>
                      </div>
                    </section>

                    <footer className="flex justify-end px-8 pb-8 pt-4">
                      <button onClick={() => handleSaveTag()} className="flex justify-center rounded-sm px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none">
                      {isTagging ? 
                        <>
                            <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="font-medium">Saving</span>
                        </>
                        :
                        <span className="font-medium">Save</span>
                      }
                      
                      </button>
                      <button type="button" onClick={() => setShowModalTag(false)} className="ml-3 rounded-sm px-3 py-1 hover:bg-gray-300 focus:shadow-outline focus:outline-none">
                        Close
                      </button>
                    </footer>
                  </article>
                {/* </form> */}
              </main>   
            </div>
          ) : null }
          </>
          :
          <div className="container mx-auto px-4 h-full">
              <div className="flex content-center items-center justify-center h-full ">
                <div className="w-full lg:w-4/12 sm:w-6/12 md:w-4/12 px-4">
                  <div className="relative flex flex-col min-w-0 break-words w-full mb-6 ">
                    <div className="rounded-t mb-0 px-6 py-6"></div>
                    <div className="flex-auto px-4  py-10 pt-0">
                      <div className="max-w-screen-lg mx-auto pb-3 flex justify-center">
                        <img src="/icons/bulkimage.png" alt="tranzetta-logo" className="w-7/12" />
                      </div>
                      <div className="text-md font-medium text-center mb-10">Please provide the details below to proceed</div>
                      <form onSubmit={handleConnectSave}>
                        <div className="relative w-full mb-3">
                          <label className="input-label" htmlFor="grid-password">
                            WebDav Path
                          </label>
                          <input
                            type="text"
                            className="text-blueGray-600 placeholder-blueGray-300 bg-white rounded input-field mt-2 border border-gray-30"
                            required
                            value={path}
                            onChange={e => setPath(e.target.value)}
                          />
                        </div>

                        <div className="relative w-full mb-3">
                          <label className="input-label" htmlFor="grid-password">
                            WebDav Username
                          </label>
                          <input
                            type="text"
                            className="text-blueGray-600 placeholder-blueGray-300 bg-white rounded input-field mt-2 border border-gray-30"
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                          />
                        </div>

                        <div className="relative w-full mb-3">
                          <label className="input-label" htmlFor="grid-password">
                            WebDav Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="text-blueGray-600 placeholder-blueGray-300 bg-white rounded input-field mt-2 border border-gray-30"
                              required
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                            />
                            <i
                              className={`fas ${
                                showPassword ? 'fa-eye-slash' : 'fa-eye'
                              } absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-blueGray-300`}
                              onClick={() => setShowPassword(!showPassword)}
                            ></i>
                          </div>
                        </div>
                        
                        <div className="text-center mt-6">
                          <button className="flex justify-center h-11 bg-lightBlue-600 active:bg-lightBlue-600 btn-primary w-full" type="submit">
                          {isProcessing ? 
                            <>
                                <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-white text-base">{!connected ? 'Connecting to WebDav' : 'Saving Configuration'}</span>
                            </>
                            :
                            <span className="text-white text-base">{!connected ? 'Connect' : 'Save'}</span>
                            // <span className="font-medium">Upload</span>
                          }
                          
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
          </div>
    }
    </>
  );
}

// Settings.layout = withAuth(Admin);

// getServerProps - check what store is requesting, then get the webdav configuration from v2 then if connected then go to upload file directly

