console.log("hello world");

fetch('https://im3-projekt.wanderpodcastecho.ch/unload.php')
    .then(response => response.json())
    .then (data =>{
        console.log(data);

    })

    .catch(error => {

        console.error ('Error:', error);

    });