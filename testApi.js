async function checkSearch(query) {
  let url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&piprop=original&format=json&origin=*`;
  let res = await fetch(url);
  let data = await res.json();
  console.log("SEARCH IMAGE FOR", query, JSON.stringify(data.query?.pages, null, 2));
}
checkSearch("burj khalifa");
