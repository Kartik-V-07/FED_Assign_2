
    const clientId = '779fc3bb3f3b4715a01e3dd88cb00ed8'; 
    const clientSecret = 'd8b71117636a49999cee41db32d69c94'; 
    const searchInput = document.getElementById('searchInput');
    const artistCheck = document.getElementById('artistCheck');
    const albumCheck = document.getElementById('albumCheck');
    const playlistCheck = document.getElementById('playlistCheck');
    const searchResults = document.getElementById('searchResults');
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeBtn = document.getElementById('volumeBtn');
    const progressBar = document.getElementById('progressBar');
    const timeCounter = document.getElementById('timeCounter');
    const volumeBar = document.getElementById('volumeBar');

    async function search() {
        const query = searchInput.value;
        const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
            headers: {
                'Authorization': 'Bearer ' + await getToken()
            }
        });
        const data = await response.json();
        displaySearchResults(data);
    }

    function displaySearchResults(data) {
        searchResults.innerHTML = '';
    
        if (data && data.tracks && data.tracks.items && data.tracks.items.length > 0) {
            data.tracks.items.forEach(track => {
                const li = createListItem(track.name, track.album.images.length > 0 ? track.album.images[0].url : '', () => playSong(track.preview_url));
                searchResults.appendChild(li);
            });
        } 
        if (data && data.artists && data.artists.items && data.artists.items.length > 0) {
            data.artists.items.forEach(artist => {
                const li = createListItem(artist.name, artist.images.length > 0 ? artist.images[0].url : '', () => searchMusic(artist.id, 'artist'));
                searchResults.appendChild(li);
            });
        } 
        if (data && data.albums && data.albums.items && data.albums.items.length > 0) {
            data.albums.items.forEach(album => {
                const li = createListItem(album.name, album.images.length > 0 ? album.images[0].url : '', () => searchMusic(album.id, 'album'));
                searchResults.appendChild(li);
            });
        } 
        if (data && data.playlists && data.playlists.items && data.playlists.items.length > 0) {
            data.playlists.items.forEach(playlist => {
                const li = createListItem(playlist.name, playlist.images.length > 0 ? playlist.images[0].url : '', () => searchMusic(playlist.id, 'playlist'));
                searchResults.appendChild(li);
            });
        } 
        if (!data || (!data.tracks || !data.tracks.items) && (!data.artists || !data.artists.items) && (!data.albums || !data.albums.items) && (!data.playlists || !data.playlists.items)) {
            const li = document.createElement('li');
            li.textContent = 'No results found';
            searchResults.appendChild(li);
        }
    }
    
    
    function createListItem(name, imageUrl, onClick) {
        const li = document.createElement('li');
        li.classList.add('search-item');
        
        const span = document.createElement('span');
        span.textContent = name;
        li.appendChild(span);
        
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Image';
            img.classList.add('search-image');
            li.appendChild(img);
        }
        
        li.addEventListener('click', onClick);
        li.addEventListener('dblclick', () => addToFavorites(name, imageUrl, onClick));
        return li;
    }
    async function searchMusic(id, type) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/${type}s/${id}/tracks`, {
                headers: {
                    'Authorization': 'Bearer ' + await getToken()
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Tracks for this artist are not available.');
                    // Handle the error gracefully, such as displaying a message to the user.
                } else {
                    throw new Error('Network response was not ok');
                }
            }
            
            const data = await response.json();
            displaySearchResults(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    async function getToken() {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: 'grant_type=client_credentials'
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch access token');
            }
    
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error fetching access token:', error);
            return null;
        }
    }