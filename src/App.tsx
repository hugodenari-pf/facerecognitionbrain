import ParticlesBg from "particles-bg";
import "./App.css";
import {ImageLinkForm} from "./components/ImageLinkForm/ImageLinkForm";
import {Logo} from "./components/Logo/Logo";
import {Navigation} from "./components/Navigation/Navigation";
import {FaceRecognition} from "./components/FaceRecognition/FaceRecognition";
import {Rank} from "./components/Rank/Rank";
import { useState } from "react";
import {Signin} from "./components/Signin/Signin";
import {Register} from "./components/Register/Register";
import React from "react";

export interface Box {
  leftCol: number;
  rightCol: number;
  topRow: number;
  bottomRow: number;
}

export interface User {
  id: string | undefined;
  name: string | undefined ;
  email: string | undefined;
  entries: number | undefined;
  joined: string | undefined;
}

export const App = () => {
    const MODEL_ID = "face-detection";
    const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";
    const PAT = "886c07e8845b46c4a35d0abd70b7db26";
    const USER_ID = "hugodenaridev";
    const APP_ID = "my-first-application-aurp3b";
    const [input, setInput] = useState("");
    const [imageUrl, setImageUrl] = useState("")
    const [user, setUser] = useState<User>();
    const [box, setBox] = useState<Box>();
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [route, setRoute] = useState("signin")

    const loadUser = (data: any) => {
      setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          entries: data.entries,
          joined: data.joined
        });
    };

    const getRequestOptions = () => {
      const IMAGE_URL = imageUrl;

      const raw = JSON.stringify({
        user_app_id: {
          user_id: USER_ID,
          app_id: APP_ID,
        },
        inputs: [
          {
            data: {
              image: {
                url: IMAGE_URL,
              },
            },
          },
        ],
      });

      return {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: "Key " + PAT,
        },
        body: raw,
      };
    };

    const calculateFaceLocation = (data) => {
      const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById('inputimage');
      const width = Number(image?.offsetWidth);
      const height = Number(image?.offsetHeight);
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      };
    };

    const displayFaceBox = (box) => {
      setBox(box)
    };

    const onInputChange = (event) => {
      setInput(event.target.value)
    }

    const onButtonSubmit = () => {
      fetch(
        "https://api.clarifai.com/v2/models/" +
        MODEL_ID +
        "/versions/" +
        MODEL_VERSION_ID +
        "/outputs",
        getRequestOptions()
      )
        .then((response) => {
          console.log("hi", response);
          setImageUrl(input)
          if (response) {
            fetch("http://localhost:3000/image", {
              method: "put",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: user?.id,
              }),
            })
              .then((response) => response.json())
              .then((count) => {
                setUser({id: user?.id, email: user?.email, joined: user?.joined, name: user?.name, entries: count});
              });
          }
          displayFaceBox(calculateFaceLocation(response));
        })
        .catch((err) => console.log(err));
    }

    const onRouteChange = (route) => {
      if (route === "signout") {
        setIsSignedIn(false)
      } else if (route === "home") {
        setIsSignedIn(true)
      }
      setRoute(route)
    };

    return (
      <div className="App">
        <ParticlesBg type="fountain" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
        {route === "home" ? (
          <div>
            <Logo />
            <Rank name={user?.name} entries={user?.entries} />
            <ImageLinkForm
              onInputChange={onInputChange}
              onButtonSubmit={onButtonSubmit} />
            {box && <FaceRecognition box={box} imageUrl={imageUrl} />}
          </div>
        ) : route === "signin" ? (
          <Signin loadUser={loadUser} onRouteChange={onRouteChange} />
        ) : (
          <Register loadUser={loadUser} onRouteChange={onRouteChange} />
        )}
      </div>
    );
}
