<img src="https://utfs.io/f/81a9884c-9a8d-4056-b112-9c98b01f4996-lqmfc8.png">
<h1>Snaphoard</h1>
Snaphoard is a social media app where users can create their own posts and interact with posts created by other users. This project was created for CRUx Round 3 Submission 2023-24 batch Session 2. 

<h2>Tech Stack</h2>
The stack of the project is as follows:
<h3>1. TypeScript</h3>
<p>the entirety of the project is written in this language according to the constraints of our task.</p>
<h3>2. Express</h3>
<p>for backend a basic express server is hosted on render for api calls and webhooks for stripe payments</p>
<h3>3. Next.js</h3>
<p>for client side next.js is used as the core react framework for the project. but for two instances serverless functions are used : first for implementing a minutely cronjob via vercel cronjobs and second for implementing file routing for uploadthing (the reason for this is lack of documentation on uploadthings page on backend adapters like express as the clientonuploadcomplete hook didn't work for me while using express). it was also chosen as my react framework because it is the best platform to deal with large scale apps and it handles scalability pretty well</p>
<h3>4. Supabase</h3>
<p>supabase in this project is basically used just as a postgress provider it was choosen because I had familiarity with the service and the reason of it being used as just a postgress provider is that the task demanded us to create the fastest way to implement jwt authentication so instead going for the pre existing supabase auth . I went to create my own auth by saving jwt information tokens on session storage. as I didn't use supabase auth it restricted me to not use supabase storage. it was chosen as my postgress provider and even as service because it being a open source software it gives me the freedom to move my social media from a third party's server dependence to a self hosted open via a docker container </p>
<h3>5. Uploadthing </h3>
<p>uploadthing is used here to save post attachments and pfps for users (in future)</p>
<h3>6. Stripe</h3>
<p>Stripe webhooks are created for virtual gift and even the backend is created for virtual gift tranfers but it hasn't implemented on frontend yet you can view the backend at <a href="https://github.com/achaljhawar/snaphoard-server">snaphoard-server</a></p>

<h2>Features: </h2>
<ul>
  <li> users have two options to join the platform by either being a poster (who can post and interact with posts) or be a viewer (who can just interact with posts)
  <li> while signing up the sha256 hash of the password is saved on the database and while validating on login the input's hash is checked with user's hash
  <li> a email verification system is created to verify the email of signed up users by sending emails via nodemailer and using google's smtp server for emails via snaphoard@gmail.com
  <li> users with poster can create their own posts and while uploading a poster they also get a preview of their poster (by converting the input file image object to base64 and using useState to change the src of the image from a place holder to a base 64 data url of the object)
  <li> users can also schedule their posts for a future data and time which would then be picked up by the cron job which is called every minute and shifts posts from schelduled posts table to posts table
  <li> users can interact with posts by liking or saving it for their view later list
  <li> users can view realtime changes in their posts like count via sockets which emit event and change the like counter.
  <li> users can view their liked posts over the last week
  <li> users can view every posts single post view where they can get a proper view of the poster and comment about it (in the future)
  <li> users can view their view later posts via their saved posts list
    
  
</ul>