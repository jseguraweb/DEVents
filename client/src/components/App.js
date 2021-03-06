import React, { useState, useEffect } from "react";
import { HashRouter, Route, Switch } from 'react-router-dom';
import '../style/App.scss';
import NavBarSignedIn from "./NavBarSignedIn";
import NavBarSignedOut from "./NavBarSignedOut";
import Landing from "./Landing";
import Login from "./Login";
import Registration from './Registration'
import Events from "./Events";
import SignUp from './SignUp';
import Footer from './Footer';
import Account from "./Account";
import EventInformation from "./EventInformation";
import CreateEvent from "./CreateEvent";
import Contact from "./Contact";
import Faq from "./Faq";
import Context from './Context';
import Moment from "moment";
import Logout from './Logout';
import DeletedAccount from './DeletedAccount';


const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // const [events, setEvents] = useState('');
  const [meetups, setMeetups] = useState('');
  const [meetupsCities, setMeetupsCities] = useState('');
  const [workshops, setWorkshops] = useState('');
  const [workshopsCities, setWorkshopsCities] = useState('');
  const [conventions, setConventions] = useState('');
  const [conventionsCities, setConventionsCities] = useState('');
  const [allEventsTogether, setAllEventsTogether] = useState('');

  // so that the user can delete his events althought they took already place in the past, we need an array of ALL the meetups without filtering them by date:
  const [unfilteredMeetups, setUnfilteredMeetups] = useState('');

  const [userData, setUserData] = useState(null);
  // localstorage to save the token coming from the header. by clicking on signout the localstorage will be cleared:
  const [token, setToken] = useState(localStorage.getItem('token'));
  // this is the state that is going to carry all the information of one specific event, when the user clicks on it to see the description:
  const [eventInfo, setEventInfo] = useState(null);

  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // FUNCTION FETCHING ALL THE EVENTS:
  const fetchEvents = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const allEvents = [];

    const allMeetups = [];

    const request1 = await fetch('/events', options);
    const response1 = await request1.json();
    response1.events.map(meetup => {
      allMeetups.push({
        title: meetup.title,
        description: meetup.description,
        url: meetup.website,
        date: meetup.date,
        time: meetup.time,
        city: meetup.location !== 'Online event' ? meetup.location.split(', ')[1] : 'Online event',
        coordinates: meetup.coordinates,
        imgUrl: meetup.imgUrl,
        location: meetup.location.length > 2 ? meetup.location : 'Online event',
        authorId: meetup.authorId,
        _id: meetup._id,
        type: 'meetup',
        hostedBy: meetup.hostedBy,
        lat: meetup.coordinates.length > 2 ? parseFloat(meetup.coordinates.split(',')[0].slice(7, 14)) : null,
        lng: meetup.coordinates.length > 2 ? parseFloat(meetup.coordinates.split(',')[1].slice(6, 13)) : null
      });
      allEvents.push({
        title: meetup.title,
        description: meetup.description,
        url: meetup.website,
        date: meetup.date,
        time: meetup.time,
        city: meetup.location !== 'Online event' ? meetup.location.split(', ')[1] : 'Online event',
        coordinates: meetup.coordinates,
        imgUrl: meetup.imgUrl,
        location: meetup.location.length > 2 ? meetup.location : 'Online event',
        authorId: meetup.authorId,
        _id: meetup._id,
        type: 'meetup',
        hostedBy: meetup.hostedBy,
        lat: meetup.coordinates.length > 2 ? parseFloat(meetup.coordinates.split(',')[0].slice(7, 14)) : null,
        lng: meetup.coordinates.length > 2 ? parseFloat(meetup.coordinates.split(',')[1].slice(6, 13)) : null
      });
    });

    setUnfilteredMeetups(allMeetups);

    const filteredMeetups = allMeetups.filter(meetup => new Date(meetup.date).getTime() > new Date().getTime());

    filteredMeetups.sort((a, b) => new Moment(a.date).format('MMDDYYYY') - new Moment(b.date).format('MMDDYYYY'));
    const citiesWithMeetups = [];
    filteredMeetups.map(event => citiesWithMeetups.push(event.city));
    setMeetupsCities([...new Set(citiesWithMeetups)].sort());
    setMeetups(filteredMeetups);

    const allWorkshops = [];

    const request2 = await fetch('/workshops', options);
    const response2 = await request2.json();
    // console.log('WORKSHOPS - Response: ', response2);
    response2.events.map(workshop => { allWorkshops.push(workshop); allEvents.push(workshop) });
    allWorkshops.sort((a, b) => new Moment(a.date).format('MMDDYYYY') - new Moment(b.date).format('MMDDYYYY'))
    const allFilteredWorkshops = allWorkshops.filter(workshop => new Date(workshop.date).getTime() > new Date().getTime());

    const citiesWithWorkshops = [];
    allFilteredWorkshops.map(event => citiesWithWorkshops.push(event.city));
    setWorkshopsCities([...new Set(citiesWithWorkshops)].sort());
    setWorkshops(allFilteredWorkshops);


    const allConventions = [];

    const request3 = await fetch('/conventions', options);
    const response3 = await request3.json();
    // console.log('CONVENTIONS - Response: ', response3);
    response3.events.map(convention => { allConventions.push(convention); allEvents.push(convention) });
    allConventions.sort((a, b) => new Moment(a.date).format('MMDDYYYY') - new Moment(b.date).format('MMDDYYYY'))
    const allFilteredConventions = allConventions.filter(convention => new Date(convention.date).getTime() > new Date().getTime());

    const citiesWithConventions = [];
    allFilteredConventions.map(event => citiesWithConventions.push(event.city));
    setConventionsCities([...new Set(citiesWithConventions)].sort());
    setConventions(allFilteredConventions);

    const filteredEvents = allEvents.filter(event => new Date(event.date).getTime() > new Date().getTime());
    // console.log('FILTERED EVENTS: ', filteredEvents);
    setAllEventsTogether(filteredEvents);
  };

  // console.log('ALL EVENTS FETCHED: ', allEventsTogether);

  // FETCHING THE USER INFORMATION - USER SESSION:
  const getUserData = async () => {
    const options = {
      method: 'GET',
      headers: {
        'x-auth': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const response = await fetch('/users', options);
    const data = await response.json();
    // console.log('RESPONSE TO GET USERDATA: ', data)
    setUserData(data.user);
  };


  // FETCHING GOOGLE MAPS API:
  useEffect(() => {
    const script = document.createElement('script');

    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places`;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);


  // LOAD THE USER DATA IF LOGGED IN:
  useEffect(() => {
    if (token) {
      setLoggedIn(true);
      getUserData();
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);


  useEffect(() => {
    fetchEvents();
  }, [eventInfo]);

  useEffect(() => {
    fetchEvents();
  }, [userData]);

  // console.log('EVENT INFO: ', eventInfo);

  return (
    <div className="App">
      <Context.Provider value={{ unfilteredMeetups, lat, setLat, lng, setLng, allEventsTogether, meetupsCities, workshopsCities, conventionsCities, getUserData, fetchEvents, loggedIn, setLoggedIn, token, setToken, userData, setUserData, eventInfo, setEventInfo, meetups, setMeetups, workshops, conventions }}>
        <HashRouter>
          {
            loggedIn ?
              <NavBarSignedIn />
              :
              <NavBarSignedOut />
          }
          <Switch>
            <Route path="/" exact component={Landing} />
            <Route path="/registration" component={Registration} />
            <Route path="/signup" component={SignUp} />
            <Route path="/login" component={Login} />
            <Route path="/events" component={Events} />
            <Route path="/account" component={Account} />
            <Route path="/event" component={EventInformation} />
            <Route path="/addevent" component={CreateEvent} />
            <Route path="/contact" component={Contact} />
            <Route path="/faq" component={Faq} />
            <Route path="/logout" component={Logout} />
            <Route path="/deletedaccount" component={DeletedAccount} />
          </Switch>
          <Footer />
        </HashRouter>
      </Context.Provider>
    </div>
  );
};

export default App;