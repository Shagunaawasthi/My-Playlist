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
        return sum + eachSong.duration
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
           <img src={playlist.imageUrl}/>
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
    console.log(window.location.search);
     let parsed= queryString.parse(window.location.search);
      let accessToken=parsed.access_token;
    console.log(accessToken);
       
       fetch('https://api.spotify.com/v1/me',{
         headers:{'Authorization':'Bearer '+ accessToken}
       }).then(response => response.json())
          .then(data=>this.setState({
            user:{
              name:data.display_name,
            }
          }));
      /*
          fetch('https://api.spotify.com/v1/me/playlists',{
          headers:{'Authorization':'Bearer '+ accessToken}
        }).then(response => response.json())
          .then(data=>this.setState({
         playlists:data.items.map(item => ({
              name: item.name,
               songs : [],
              }))
              }))*/

              fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {'Authorization': 'Bearer ' + accessToken}
              }).then(response => response.json())
              .then(playlistData=>{
                let playlists= playlistData.items
                let trackDataPromises=playlists.map(playlist=>{
                 let responsePromise=fetch(playlist.tracks.href,{
                  headers: {'Authorization': 'Bearer ' + accessToken}
                })
                let trackDataPromise=responsePromise
                .then(response=>response.json())
                return trackDataPromise
                })
                let allTracksDatasPromises= Promise.all(trackDataPromises)
               let playlistsPromise=allTracksDatasPromises.then(trackDatas=>{
                  trackDatas.forEach((trackData,i)=>{
                    playlists[i].trackDatas=trackData.items
                    .map(item=>item.track)
                    .map(trackData=>({
                      name:trackData.name,
                      duration:trackData.duration_ms/1000
                    }))
                  })
                  return playlists
                })
                return playlistsPromise
              })
              .then(playlists => this.setState({
                playlists: playlists.map(item => {
                   console.log(item.trackDatas)
                  return {
                    name: item.name,
                    imageUrl: item.images[0].url, 
                    songs: item.trackDatas.slice(0,5).map(trackData=>({
                      name:trackData.name
                    }))
                  }
              })
              }))
            }

  render() {
       let playlistsToRender=this.state.user && 
        this.state.playlists
         ? this.state.playlists.filter((playlist)=>{
           let matchesPlaylist= playlist.name.toLowerCase().includes(
            this.state.filterString.toLowerCase())
            let matchesSong=playlist.songs.find(song=>song.name.toLowerCase()
            .includes(this.state.filterString.toLocaleLowerCase()))
            //matchesSong will always be true cause it an array and empty
            //ones are counted as well thus matchesSong.length >0 condition
            //but we changed filter to find. It is faster than filter too.
     return matchesPlaylist||matchesSong
      }) : []
    return (
      <div className="App">
        {this.state.user ?
          <div>
          <h1>{this.state.user.name}'s Playlist</h1>
              <PlaylistCounter playlists={playlistsToRender}/>
              <HoursCounter playlists={playlistsToRender}/>  
              <Filter onTextChange={text=>this.setState({filterString:text})}/>
              {playlistsToRender.map((playlist,index)=>{
                return <Playlist playlist={playlist}/>
              } ) }
           </div> :<button onClick={()=>{return window.location="http://localhost:8888/login/"}}>Sign in with spotify</button>
           }
      </div>
    );
  }
}

export default App;
