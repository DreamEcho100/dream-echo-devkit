
Take a deep breath, and deep, informative, detailed explanation
And examples  + code examples
What do you think of this Reddit threads they should be related to what you last analyzed

Another threads

```
[deleted]
[deleted]
•
2y ago
When my wife starts flirting with phrase "A component is changing an uncontrolled input to be controlled"



Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

[deleted]
[deleted]
•
2y ago
I usually use react-hook-form with yup resolver


Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

agilius
OP
•
2y ago
Seems like she knows how to "set your state" :D


Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

u/xabrol avatar
xabrol
•
1y ago
•
Edited 1y ago
React Hook Forms is stead fast on only conforming to plain text the way HTML Inputs conform to plain text. They make no exceptions to this rule and even go so far as to strip methods off any objects you give RHF for field values.

For example, if I have a Luxon Date and I use it in a model that I give to react hook forms RHF will strip off all the methods of the Luxon date, including it's "TOJson" method.

This is a huge problem for us, because all of our backend models want iso dates, and all of our client code wants Luxon Dates. So what we want to do is deserialize our json from the backend API with Luxon Dates in the objects instead of ISO Strings.

Then we want to rely on our API layers ToJson to convert all the luxons into ISO Strings. This way we can refer to strong Luxon Date objects all over our app and we don't have to parse ISO Strings everytime we want to work with the date, like shift time zones, etc etc.

But, because RHF strips the to json off, when the API serializes the luxon date it will be a massive JSON object containing all of the Luxon Object stuff instead of just an ISO String.

This sucks pretty hard. React Hook Forms doesn't give you a way of storing data that isn't a string in any state anywhere.

This also makes dirty tracking really really hard in some scenarios.

It kind of sucks. Mobx and Mobx Forms is better.

The proper way to use React Hook Forms is to create a simple string object model for every form in your app, dedicated to every form. And then do the work to enable you to translate those to real API models, so your api objects are not what you are binding to forms.

But we have an absolutely MASSIVE app and many hundreds of API models and api services.... Having to maintain all those form models and map them to back end models is a real PITA.

Additionally, RHF Typescript uses a lot of utility types, so on any MASSIVE Types with hundreds of fields on it RHF kind of chokes, it can take 10-15 seconds to get intellisense updates on the form.

RHF kind of forces you to write code a certain way and I don't like things that make me write code a certain way. I do what I do to keep it simple for the back end complexity, but RHF makes me make it complex.

If you have a MASSIVE project with a massive legacy backend with many hundreds of JSON Models and you're going to use React Hook Forms and something like SignalR etc... It's worth investing the time into backend code generation to generation your client models and RHF objects from your back end models. I.e. Generate Typescript Models/interfaces/forms etc for all C# models using C# Custom Attributes and Reflection. Developing a good pattern and then the generation layer will save truck loads of time in the long run only having to manage models in one place.



Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

agilius
OP
•
1y ago
That sounds like a very specific and troublesome scenario. Thanks for sharing that.

I'm having a hard time understanding the Date problem. You said a couple of times you cannot store anything but strings in the internal state of the RHF library. That is strange, because I often store more than just string in there. I often use a pattern of serialisation and deserialisation of values in the field, so the field renders something very simple like a string, but sends over to the server something different.

I started to share some of the process of working with forms in a youtube channel and the next video I'll release will be about a date picker (from Antd) that works with https://day.js.org/, and in the video after that I'll refactor the code to have reusable fields that serialise and deserialise values for the RHF fields. It might be worth checking out, https://www.youtube.com/@vlad.nicula (please excuse the poor editing, I'm new and still learning how to edit videos)


Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
```

Another threads

```
[deleted]
[deleted]
•
2y ago
When my wife starts flirting with phrase "A component is changing an uncontrolled input to be controlled"



Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

[deleted]
[deleted]
•
2y ago
I usually use react-hook-form with yup resolver


Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

agilius
OP
•
2y ago
Seems like she knows how to "set your state" :D


Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

u/xabrol avatar
xabrol
•
1y ago
•
Edited 1y ago
React Hook Forms is stead fast on only conforming to plain text the way HTML Inputs conform to plain text. They make no exceptions to this rule and even go so far as to strip methods off any objects you give RHF for field values.

For example, if I have a Luxon Date and I use it in a model that I give to react hook forms RHF will strip off all the methods of the Luxon date, including it's "TOJson" method.

This is a huge problem for us, because all of our backend models want iso dates, and all of our client code wants Luxon Dates. So what we want to do is deserialize our json from the backend API with Luxon Dates in the objects instead of ISO Strings.

Then we want to rely on our API layers ToJson to convert all the luxons into ISO Strings. This way we can refer to strong Luxon Date objects all over our app and we don't have to parse ISO Strings everytime we want to work with the date, like shift time zones, etc etc.

But, because RHF strips the to json off, when the API serializes the luxon date it will be a massive JSON object containing all of the Luxon Object stuff instead of just an ISO String.

This sucks pretty hard. React Hook Forms doesn't give you a way of storing data that isn't a string in any state anywhere.

This also makes dirty tracking really really hard in some scenarios.

It kind of sucks. Mobx and Mobx Forms is better.

The proper way to use React Hook Forms is to create a simple string object model for every form in your app, dedicated to every form. And then do the work to enable you to translate those to real API models, so your api objects are not what you are binding to forms.

But we have an absolutely MASSIVE app and many hundreds of API models and api services.... Having to maintain all those form models and map them to back end models is a real PITA.

Additionally, RHF Typescript uses a lot of utility types, so on any MASSIVE Types with hundreds of fields on it RHF kind of chokes, it can take 10-15 seconds to get intellisense updates on the form.

RHF kind of forces you to write code a certain way and I don't like things that make me write code a certain way. I do what I do to keep it simple for the back end complexity, but RHF makes me make it complex.

If you have a MASSIVE project with a massive legacy backend with many hundreds of JSON Models and you're going to use React Hook Forms and something like SignalR etc... It's worth investing the time into backend code generation to generation your client models and RHF objects from your back end models. I.e. Generate Typescript Models/interfaces/forms etc for all C# models using C# Custom Attributes and Reflection. Developing a good pattern and then the generation layer will save truck loads of time in the long run only having to manage models in one place.



Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

agilius
OP
•
1y ago
That sounds like a very specific and troublesome scenario. Thanks for sharing that.

I'm having a hard time understanding the Date problem. You said a couple of times you cannot store anything but strings in the internal state of the RHF library. That is strange, because I often store more than just string in there. I often use a pattern of serialisation and deserialisation of values in the field, so the field renders something very simple like a string, but sends over to the server something different.

I started to share some of the process of working with forms in a youtube channel and the next video I'll release will be about a date picker (from Antd) that works with https://day.js.org/, and in the video after that I'll refactor the code to have reusable fields that serialise and deserialise values for the RHF fields. It might be worth checking out, https://www.youtube.com/@vlad.nicula (please excuse the poor editing, I'm new and still learning how to edit videos)


Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
```

Another threads

```
[deleted]
Fresh_chickented
•
2y ago
I cant live without formik thats it. using react useState too much delay (lack of re-render makes me frustrated, althought the performance is better) and the management is much more complicated


Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

dooblr
•
9mo ago
•
Edited 9mo ago
I'm gonna necro this thread and say both are a fucking mess. It's 2023 and handling forms should not be this difficult.


Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share
```
