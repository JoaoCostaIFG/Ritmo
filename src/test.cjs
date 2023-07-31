const yt = require("play-dl");

const urlSearch = "https://www.youtube.com/results?search_query=url";
const urlChannel = "https://www.youtube.com/@theUrltv"
const urlVideo = "https://www.youtube.com/watch?v=nC9lpgK7vqw"
const urlPlaylist = "https://www.youtube.com/watch?v=_q9AavR98gE&list=PLsH1q718n9B8hvmw44XrxPL3mDvGbDV9i"
const urlPlaylist2 = "https://www.youtube.com/watch?v=Uc0cQoBnNEA&list=PLsH1q718n9B8hvmw44XrxPL3mDvGbDV9i&index=2"

async function main() {
  // console.log(yt.yt_validate(urlSearch));
  // console.log(yt.yt_validate(urlChannel));
  // console.log(yt.yt_validate(urlVideo));
  console.log(yt.yt_validate(urlPlaylist));

  // let info = await yt.video_info(urlPlaylist);
  // console.log(info.video_details.title + " : " + info.video_details.url);

  // info = await yt.video_info(urlPlaylist2);
  // console.log(info.video_details.title + " : " + info.video_details.url);

  let info = await yt.playlist_info(urlPlaylist, { incomplete: true });
  
  console.log(info.total_pages)

  // console.log(info.page(1).slice(0, Infinity))

  // console.log(info.fetch({max: 1}));
  // console.log(info.videos)
}

main();