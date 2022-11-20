// HERE BE DRAGONS

const selectPostRequest = document.querySelector("#select-post-request");
const inputPostLocation = document.querySelector("#input-post-location");
const textareaPostDescription = document.querySelector("#textarea-post-description");
const inputPostImages = document.querySelector("#input-post-images");
const buttonPostSend = document.querySelector("#button-post-send");
const selectFilterRequest = document.querySelector("#select-filter-request");
const inputFilterLocation = document.querySelector("#input-filter-location");
const textareaFilterDescription = document.querySelector("#textarea-filter-description");
const postDisplayArea = document.querySelector("#display-posts");
const buttonCreatorToggle = document.querySelector("#button-creator-toggle");
const divPostCreator = document.querySelector("#post-creator");

const elements = ['']

const request = async (type, data = {}) => await (await fetch("/", {
	method: "POST",
	body: JSON.stringify({
		...data,
		type
	})
})).json();

let displayedPosts = [];

const refreshPosts = async () => {
	const posts = await request("getPosts", {
		request: selectFilterRequest.value,
		location: inputFilterLocation.value,
		description: textareaFilterDescription.value
	});
  console.log(posts);
	while (postDisplayArea.lastChild)
		postDisplayArea.removeChild(postDisplayArea.lastChild);
	for (const post of posts) {
		const elem = document.createElement("div");
		elem.className = "postDiv";
    for (const url of JSON.parse(post.images)) {
			const img = document.createElement("img");
			img.src = url;
			img.className = "postImg";
			img.width = "200";
      img.addEventListener("mouseover", function() {
        const popUpDiv = document.createElement("div");
        popUpDiv.className = "pop-up";
        const popUpImg = document.createElement("img");
        popUpImg.src = img.src;
        popUpImg.className = "pop-up-img";
        popUpDiv.appendChild(popUpImg);
        popUpDiv.tabIndex = 0;
        popUpDiv.style.top = `${window.pageYOffset + 0.5 *(screen.height) - (img.offsetHeight + 20)}px`;
        console.log(popUpDiv.style.top);
        document.querySelector("body").appendChild(popUpDiv);
      });
      img.addEventListener('mouseleave', () => document.querySelector(".pop-up").remove());
			elem.appendChild(img);
    }
    const p1 = document.createElement("p");
		p1.textContent = "Request: " + post.request;
    p1.onclick = function() {// This allows you to filter for a request type // oh cool
      // clicking on that request header
      selectFilterRequest.value = p1.textContent.slice(9, p1.textContent.length);
      refreshPosts();
    } 
    p1.className = "req";
		elem.appendChild(p1);
		const p2 = document.createElement("p");
		p2.textContent = "Location: " + post.location;
		elem.appendChild(p2);
		const p3 = document.createElement("p");
		p3.textContent = "Description: " + post.description;
		elem.appendChild(p3);
	  const p4 = document.createElement("p");
    p4.style.clear = "both";
		const b = document.createElement('button');
		b.textContent = "Mark as Resolved";
		b.addEventListener('click', async () => {
			if (confirm('Resolve issue?'))
				request('removePost', {
					uuid: post.uuid
				});
				await refreshPosts();
		})
		elem.appendChild(b);
    elem.appendChild(p4);
		postDisplayArea.appendChild(elem);
		// await new Promise((resolve) => setTimeout(resolve, 100));
	}
	displayedPosts = postDisplayArea.childNodes;
	scroll(0, 0)
};


buttonPostSend.addEventListener("click", async () => {
	const stuff = {
		request: selectPostRequest.value,
		location: inputPostLocation.value,
		description: textareaPostDescription.value,
	}
	selectPostRequest.selectedIndex = 0;
	inputPostLocation.value = textareaPostDescription.value = '';
	stuff.images = JSON.stringify(await Promise.all([...inputPostImages.files].map((file) => new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener("load", () => resolve(reader.result));
			reader.addEventListener("error", (error) => reject(error));
			reader.readAsDataURL(file);
		}))))
	inputPostImages.value = '';
	alert(Object.entries(await request("createPost", stuff))[0].join(': '));
	selectPostRequest.selectedIndex = 0;
	inputPostLocation.value = textareaPostDescription.value = inputPostImages.value = "";
  	await refreshPosts();
});

// buttonCreatorToggle.addEventListener("click", () => {
// 	divPostCreator.style.display = 'block';
// 	buttonCreatorToggle.style.display = 'none';
	
// 	// if (divPostCreator.style.display === "block") {
// 	// 	divPostCreator.style.display = "none";
// 	// 	buttonCreatorToggle.textContent = "Create Post";
// 	// } else {
// 	// 	divPostCreator.style.display = "block";
// 	// 	buttonCreatorToggle.textContent = "Cancel";
// 	// }
// });


// const divPostFiltering = document.querySelector("#div-filters");
// const aaaa = document.querySelector("#button-toggle-filtering")
// aaaa.addEventListener("click",function() {
// 		divPostFiltering.style.display = "block";
// 		this.style.display = "none";
// });
document.querySelector('#filtered-search').addEventListener('click', async () => {
	// divPostFiltering.style.display = "none";
	// aaaa.style.display = "block";
	 await refreshPosts();
})

await refreshPosts();


// const vbbbbb = document.querySelector('#cancel-post').addEventListener('click', () => {
// 	divPostCreator.style.display = 'none';
// 	buttonCreatorToggle.style.display = 'block';
// })

// const [
// 	postCreatorToggle,
// 	postCreator,
// 	postTitleInput,
// 	postCategoryInput,
// 	postDescriptionInput,
// 	postImageInput,
// 	postSendButton,
// 	filterCategoryInput,
// 	postsDisplay
// ] = [
// 	'#post-creator-toggle',
// 	'#post-creator',
// 	'#post-title-input',
// 	'#post-category-input',
// 	'#post-description-input',
// 	'#post-image-input',
// 	'#post-send-button',
// 	'#filter-category-input',
// 	'#posts-display'
// ].map(document.querySelector);

// const createPostElement = (post) => {
// 	const postElement = document.createElement('div');
// 	postElement.className = 'post';

// 	const titleElement = document.createElement('div');
// 	titleElement.className = 'post-title';
// 	titleElement.textContent = post.title;
// 	postElement.appendChild(titleElement);

// 	const categoryElement = document.createElement('div');
// 	categoryElement.className = 'post-category';
// 	categoryElement.textContent = post.category;
// 	postElement.appendChild(categoryElement);

// 	const descriptionElement = document.createElement('div');
// 	descriptionElement.className = 'post-description';
// 	descriptionElement.textContent = post.description;
// 	postElement.appendChild(descriptionElement);

// 	const imageElement = document.createElement('img');
// 	imageElement.className = 'post-image';
// 	imageElement.src = post.image;
// 	postElement.appendChild(imageElement);

// 	const timestampElement = document.createElement('div');
// 	timestampElement.className = 'post-timestamp';
// 	timestampElement.textContent = post.timestamp;
// 	postElement.appendChild(timestampElement);

// 	postsDisplay.appendChild(postElement);
// };

// const socket = new WebSocket(`${location.protocol.replace('http', 'ws')}//${location.host}`);
// socket.addEventListener('open', () => console.log('socket connected'));
// socket.addEventListener('close', () => console.log('socket disconnected'));
// socket.addEventListener('message', ({ data }) => {
// 	const message = JSON.parse(data);
// 	switch (message.type) {
// 		case 'posts':
// 			while (postsDisplay.lastChild)
// 				postsDisplay.removeChild(postsDisplay.lastChild);
// 			message.posts.forEach(createPostElement);
// 			break;
// 		case 'status':
// 			alert(Object.values(message)[0]);
// 			break;
// 	}
// });
// const socketSend = (type, data = {}) => socket.send(JSON.stringify({
// 	...data,
// 	type
// }));

// postSendButton.addEventListener('click', async () => {
// 	socketSend('create', {
// 		title: postTitleInput.value,
// 		category: postCategoryInput.value,
// 		description: postDescriptionInput.value,
// 		image: await new Promise((resolve) => {
// 			const reader = new FileReader();
// 			reader.addEventListener('load', () => resolve(reader.result));
// 			reader.readAsDataURL(postImageInput.files[0]);
// 		})
// 	});

// 	postTitleInput.value = postDescriptionInput.value = postImageInput.value = '';
// 	postCategoryInput.selectedIndex = 0;
// });










// const selectLocation = document.querySelector('#select-location');
// const locationSelector=document.querySelector('#location-selector');
// const locationSelectingDone = document.querySelector('#location-selecting-done');

// selectLocation.addEventListener('click', () => {
	
// })