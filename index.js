addEventListener('fetch', event => {
  /** 
   * respond with a randomly selected  URL variantfrom the API and persists in a cookie
   */
  event.respondWith(handleRequest(event.request))
})
// Changes the incoming title
class TitleHandler {
  element(element) {
    element.prepend("Webpage Variant  ");
  }
}

// Changes the incoming header title
class HeadingHandler {
  element(element) {
    element.prepend("Chika's version of  ");
  }
}

// Changes the incoming description
class DescriptionHandler {
  element(element) {
    element.setInnerContent("Cloudflare, thank you for the opportunity and care you've shown students during this difficult time");
  }
}

// Changes the incoming call to my LinkedIn link
class URLHandler {
  element(element) {
    element.setInnerContent("Click to visit my LinkedIn!");
    element.setAttribute("href", "www.linkedin.com/in/chika-jinanwa-736b62175");
  }
}

async function handleRequest(request) {
  /**
   * Function handles all requests
   */
  let savedVariant = null; 
    //check if request had headers
    let cookieList = [];
    try {
      cookieList = request.headers.get('Cookie').split(";"); //if it has headers, get cookies from header and split
      
    }catch (e){
    cookieList = []; //not in headers, assign to an empty list
    }
    
    for (let x of cookieList){ 
      
    let tmp = x.split("=");
    if(tmp[0].trim() == "websiteVariant"){ //search available cookies with websiteVariant that stores the website version
      savedVariant = tmp[1];
    }
  }
  if(savedVariant == null){
    let requestUrl = "https://cfw-takehome.developers.workers.dev/api/variants";
    a = await fetch(requestUrl);
    resp = await a.json();
    
    console.log(resp);
    
    let urlJson = resp['variants']; //extracts array of URLs in the parsed JSON 
    console.log(urlJson); //sanity check to verify the array created
    let selectedUrl =randomUrl(urlJson);//randomly selected URL variant 
    b = await fetch(selectedUrl) //fetch request to randomly selected URL variant
    //console.log("This is the chosen variant",randomUrl(urlJson))
    // pass response to HTML Rewriter API to customize page
    const rewriter = new HTMLRewriter()
    .on('title', new TitleHandler())
    .on('h1#title', new HeadingHandler())
    .on('p#description', new DescriptionHandler())
    .on('a#url', new URLHandler());

    userResp = await b.text() //parse response as text
    console.log(userResp);
    //transformResponse = rewriter.transform(userResp)--Keeps throwing an error. I couldn't figure out why :(
    const websiteVariant = `websiteVariant=${selectedUrl};expires=Fri, 31 Dec 9999 23:59:59 GMT;Path='/';` //compose cookie
    
    return new Response(userResp, {headers:{'Content-Type':'text/html','Set-Cookie':websiteVariant}}) //sets cookie: Reference: https://developers.cloudflare.com/workers/archive/recipes/setting-a-cookie/
  }else{
    b = await fetch(savedVariant);
    userResp = await b.text();
    console.log(userResp);
    return new Response(userResp, {headers:{'Content-Type':'text/html'}})
  }

}

function randomUrl(urlJson) { 
  /**
   * function randomly selects any of the two URL variants in A/B testing style
   */
  return urlJson[Math.floor(Math.random()*urlJson.length)];
}
