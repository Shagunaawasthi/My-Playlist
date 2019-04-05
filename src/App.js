import React, { Component } from 'react';
import queryString from 'query-string';
import './App.css';
let defaultStyle={
  color: "black",
}
let fakeSeverData={
   user:{
     name:"Chiya",
    playlists:[
     {
       name:"My fav",
       songs:[
       
         {name: "havana",duration:1236},
         {name:"without me",duration:12345},
         {name:"leave a light on",duration:1236}
        ]
     },
     {
      name:" yola weekly",
      songs:[
        
         {name: "havana",duration:1236},
        {name:"without me",duration:12345},
        {name:"leave a light on",duration:1236}
       ]
    }
    ,{
      name:"sing it",
      songs:[
        
        {name: "havana",duration:1236},
        {name:"without me",duration:12345},
        {name:"leave a light on",duration:1236}
       ]
    }
    ,
    {
      name:"hymn",
      songs:[
       
        {name: "havana",duration:1236},
        {name:"without me",duration:12345},
        {name:"leave a light on",duration:1236}
       ]
    }
    
   ]
  }
};
class PlaylistCounter extends Component{
     render(){
       return(
            <div style={{width:"40%",display:"inline-block"}} className="aggregate">
              <h2>{this.props.playlists.length} playlists</h2>
            </div>
       ); 
     }
}
class HoursCounter extends Component{
  render(){
    let allSongs=this.props.playlists.reduce((songs,eachPlaylist)=>{
        return songs.concat(eachPlaylist.songs)
    },[]);
    let  totalDuration=allSongs.reduce((sum,eachSong)=>{
        return sum +eachSong.duration
    },0)
    return(
         <div style={{width:"40%",display:"inline-block"}} className="aggregate">
           <h2>{Math.round(totalDuration/60)} hours</h2>
         </div>
    ); 
  }
}
class Filter extends Component{
  render(){
    return(
     <div>
       <img/>
       <input type="text" onKeyUp={(event)=>this.props.onTextChange(event.target.value)}/>
     </div>
    );
  }
}
class Playlist extends Component{
  render(){
    let playlist= this.props.playlist;
    return(
         <div style={{...defaultStyle,display:"inline-block", width:"20%"}}>
           <img/>
           <h3>{playlist.name}</h3>
           <ul>
             {playlist.songs.map((song)=>{
                return <li>{song.name}</li>
             })}
           </ul>
         </div>
    );
  }
}
class App extends Component {
  constructor(){
    super();  
    this.state={serverData:{},
         filterString:''
     }
  }
  componentDidMount(){
     let parsed= queryString.parse(window.location.search);
      let accessToken=parsed.access_token;
        console.log(accessToken);
       fetch('https://api.spotify.com/v1/me',{
         headers:{'Authorization':'Bearer '+ accessToken}
       }).then(response => response.json())
          .then(data=>console.log(data))
    }
  render() {
       let playlistsToRender=this.state.serverData.user ?this.state.serverData.user.playlists.filter((playlist)=>
       playlist.name.toLowerCase().includes(this.state.filterString.toLowerCase())
      ) : []
    return (
      <div className="App">
        {this.state.serverData.user ?
          <div>
          <h1>{this.state.serverData.user.name}'s PLaylist</h1>
           
           
           <PlaylistCounter playlists={playlistsToRender}/>
           <HoursCounter playlists={playlistsToRender}/>
          
           <Filter onTextChange={text=>this.setState({filterString:text})}/>
           {playlistsToRender.map((playlist,index)=>{
             return <Playlist playlist={playlist}/>
          } ) }
           </div> :<button onClick={()=>{return window.location="http://localhost:8888/login"}} >Sing in with spotify</button>
           }
      </div>
    );
  }
}

export default App;
