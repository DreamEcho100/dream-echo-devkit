User
Take a deep breath, and deep, informative, detailed explanation
And examples  + code examples
What do you think of this Reddit threads

```
u/vidumec avatar
vidumec
•
3mo ago
•
Edited 3mo ago
It's the most "broken by design" lib i've ever used.

it only works well for one specific case - triggering validation when form submit button is clicked. Everything else is just broken.

you need isValid of a form as a state? Now all your inputs revalidate when one changes. And you used async validator somewhere? Now all your inputs validations will be delayed by that one async validator. So much for optimizations

you used a resolver that returns errors for other fields than the one that is being modified? RHF will just ignore the errors on other fields, it's just too cool for that.

you need to trigger validation on onChange (controlled value changes, browser autofills, etc) but not when input is focused and user is typing something in? Not possible. Trigger is broken, so you can't even hack it to validate on mount with useEffect

I don't know a better library, but my best form validating experience was writing my own Validator class, tying all input components to it and exposing a hook to access form state and validation methods.

EDIT: I managed to come up with some hacky workaround using a custom resolver hook that tracks value changes and only revalidates those that changed (or those whose dependencies changed), and another hook to revalidate default/autofilled values. Overall it works now



Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

u/Last_Distribution_84 avatar
Last_Distribution_84
OP
•
2d ago
Yeah, i felt the same



Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

u/vidumec avatar
vidumec
•
1d ago
We dropped react-hook-form in the end and wrote a custom useForm hook and custom Controller component instead, took less time than trying to tard wrangle react-hook-form



Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

u/Last_Distribution_84 avatar
Last_Distribution_84
OP
•
1d ago
I see, good for you man, just keep it simple
```

Another threads

```

Mobx, mobx-react, and mobx forms is my preferred stack on react, but rhf is pretty decent.

I have a big problem with react hook forms design pholosophy and I dont like it.

For example, if I have a DateTime from luxon2 on an object and I want to bind it to a react hook useForms default values and rely on uts toJson and json parse abilities, react hook form rips it all off . React hook forms will remive to toJson override on DateTime and cause it to not serialize properly. So when the forns submitted the entire DateTime object is serialized instead of just the iso date string....

I do not like such a strongly opinionated library dictating how I use it.

This requires me to use date strings on all my rhf models, so I have to use DateTime all over the place, lots of time zone bugs get inteoduced...

I like to create a class that instatiates itself from api responses so my dates are DateTimes in the class, and the logic is in one place.

React hook forms makes me maintain different sets of models. So we have "form models" and we can instantiate those from api models... Its more to maintain.
```

Another threads

```
jordimaister
•
2y ago
I am struggling a lot with it. I started with Formik and Material UI. Just hacking around to get the forms done. Then I ended up with a big mess. With react-forms-hook there, I don't know how.

Formik needs too many properties for each component, then you don't know if they are from Formik or Material UI.

I am trying to rewrite my forms with react-forms-hook and Material UI from scratch to see how it looks. Then port that to my app if it goes well and it's clearer.

Most struggles:

initializing a component with an empty or null value. Shows the "this component was controlled" message, never knew how it's fixdd

Dates and times, hard to use with to get it right, only works with specific combinations of properties

why can't the UI library just work with forms?????

Note: I am trying to write a lib that joins react-forms-hook and Material UI and validates with yup. All in one.



Upvote
7

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
I've struggled with initialising with empty values too. What I'm suggesting these days is to use the key property on the react component that creates the form. That way devs don't need to learn any new api to initialise and reset forms, they use pure React and unmount the empty form and mount a new form that has initialised values.



Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

jordimaister
•
2y ago
I just don't understand any of those sentences. LOL



Upvote
3

Downvote
Reply
reply

Award
0 awards

Share
Share

u/rwusana avatar
rwusana
•
2y ago
Put some kind of state in the key prop for the form, and do a set state call to change that value when you want to reset the form. The change in the key prop will trigger a hard reset of the form (as opposed to a typical soft re-render).



Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

jordimaister
•
2y ago
If somebody has to do those things, something is wrong.

It's complex and completely unrelated with the value property.
```

Another threads

```
so_lost_im_faded
•
2y ago
Just working with react-hook-form right now and I had an issue trying to make multiple-valued checkboxes with the same name to work. Issues not as in hard to implement, but lacking docs and I don't think the library has the functionality.

Example: What animals do you like? Pick multiple string[]- Cat, Dog, Platypus, Hedgehog

This didn't work with a Controlled component so I had to create my own wrapper around it. It was clunky with the reactivity as I had to use RHF's watch to be able to update the component.

I feel like it's a great tool for simple forms, but when you need something more advanced you have to code a chunk of the functionality yourself anyway.



Upvote
4

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
That's a very interesting situation that I have not encountered yet. Thanks for sharing. I'll try to build an isolated example and see how it might be handled.


Upvote
3

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
I just had this use case and used the values from the string as the controller name. It felt a little hacky but it worked seamlessly



Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

so_lost_im_faded
•
2y ago
What format was that string? I had an array of strings, did you use a comma?



Upvote
1

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
Yeah I had an array on strings and mapped over that array in the JSX and used the value of each string in the map callback to pass in “name={individualArrayValue}”. On mobile so can’t really give a good snippet example



Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

so_lost_im_faded
•
2y ago
that sounds funny! thanks I gotta try it
```

Another threads

```
zcgamer83
•
2y ago
I’ll say that learning about bracket notation for accessing object attributes was a biiiig circle back for me. Being able to write a single handler function for almost every input in my forms felt like finishing the race last… but FINISHING it lol. Go me :) Edit: missed my own point: putting handler functions under the hood with this hook made handler functions unnecessary ;)



Upvote
4

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
Interesting. Would you mind sharing what you mean by that single handler function for all your fields? I'm having a hard time visualising it.

But yeah, the `field[idx].someSubKey` notation is really helpful, especially for variable length arrays of fields



Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

zcgamer83
•
2y ago
Like a handler function to hold the value of the first name I put in useState like firstName, setFirstName. And the same for last name, joknDate, etc etc. Without that bracket notation [‘${fieldToChange}’] as a parameter, the logic simply wouldn’t work. Also, with this hook you don’t have to write a single handler, just register your input..! I’m gonna go refactor that right now, actually :D
```

Another threads

```
zcgamer83
•
2y ago
I’ll say that learning about bracket notation for accessing object attributes was a biiiig circle back for me. Being able to write a single handler function for almost every input in my forms felt like finishing the race last… but FINISHING it lol. Go me :) Edit: missed my own point: putting handler functions under the hood with this hook made handler functions unnecessary ;)



Upvote
4

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
Interesting. Would you mind sharing what you mean by that single handler function for all your fields? I'm having a hard time visualising it.

But yeah, the `field[idx].someSubKey` notation is really helpful, especially for variable length arrays of fields



Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

zcgamer83
•
2y ago
Like a handler function to hold the value of the first name I put in useState like firstName, setFirstName. And the same for last name, joknDate, etc etc. Without that bracket notation [‘${fieldToChange}’] as a parameter, the logic simply wouldn’t work. Also, with this hook you don’t have to write a single handler, just register your input..! I’m gonna go refactor that right now, actually :D
```

Another threads

```

Just recently used formik. An issue I had was accessing the current values and pass it to another component above the form.

I had to use a circus of useContext, useformikContext,, usweffect, and useState to get it to work. Still a newbie at this.
```

Another threads

```

Honestly I use react hook form professionally and their documentation is good for what you need, and then I search for code sand box examples to get references, this tends to be enough. Bill (I think?) is great at answering questions online and often he will fix and explain issues themselves.

If used correctly, RHF seems to work really well out of the box. I've seen many examples where RFH is just messy, all over the place and so on and my job would be to clean it up.

I use Yup with RFH too and it is very good and consistent pattern. I would say with RFH and yup I feel like I have the tool needed to 'solve' forms in react and don't really see how this could improve dramatically in the future without organisational structure, but as you are suggesting this may be more to do with the bad implementation of these tools rather than how they are recommending to be setup.

If you are looking to teach RFH I'd really consider if you need to create new content rather than paraphrase existing examples.



Upvote
3

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
Thanks for the feedback regarding creating new content vs inspiring from existing examples.

I often point the people attending my training to existing youtube content and articles that I find useful. What I find missing is an overall architecture ON TOP of the forms. Most youtube content I see adds API calls and routing logic in the same component with the useForm hook. I understand why they do this. The focus is on working with forms, not writing a scalable, maintainable set of components that a team of 3-4 devs would work on for months or years.

I haven't looked thru all the content that is on youtube regarding RHF, but skipping thru the top results shows me that there might still be room for additional content, specifically with typescript and schema validations, and a clearer separation of concerns between what the form does and what other layers of the app do.

If you have a few youtube/udemy videos in mind that address these concerns of mine well, please share; I'd be interested in reviewing them.



Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

Outrageous-Chip-3961
•
2y ago
Well as I said most of it is through the official documentation and a lot of stackoverflow/git pages where Bill answers a lot of questions. Then the code sand boxes. A simple search for 'react hook form with yup typescript validation + code sandbox' would be enough to start collecting tabs for a reading session.

I did find a material ui example pertinent as the controller did take a day to get my head around comfortably enough to use in our system. We ended up creating a monster autocomplete with rhf controller hook due to our use case of 20 autocomplete drop downs within a single screen. Things like this are not really around yt/udemy. Honestly they do just seem to rip off the basic rhf documentation. so again i'd just start there and spend some time researching the official documentation and then see if you can add any good examples on top of that / see any gaps there. Id say its unlikely due to Bill incorporating changes pretty quickly, its a. mature library now so its also likely to cover/teach you most things.

Its a great thing that you're teaching however, so keep at it. I was myself an evening part time web teacher for 8 years during my phd studies getting people into web design/programming. I never took it digitally but it went further than 'heres how to set up the project and the basics of how it works' but rather toward 'here's a great way to look at the basics and how they fit into the bigger picture + real world use cases' anyhoo goodluck.



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
Yep, the docs are great, and most of the time, the answer is just there, in the docs. For someone with enough ReactJs experience, that is enough. For people that have heard the concept of controlled/uncontrolled components a week or two ago, the docs are less useful as they have simple, isolated examples compared to what they have to do in the wild. I never needed a course to teach this, and most of the react course. But it's different for a lot of people.

This Reddit thread has provided me with a few additional use cases that I can take a look at too.

Thanks again for the insight!
```

Another threads

```

Live update, realtime, synchronous form. I work on an extension of an app that will live update info across forms you fill. Multiple times a common component is used at different places and under the same section. I have to reconstruct store to turn it into a pubsub store. I dont trust redux since its overcomplicated everything. I rather build myself a solution that fits in usage



Upvote
3

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
I too think that for more advanced use cases an observable store that holds the form data is ideal. But in that case, you end up writing a lot of glue code yourself for validation and syncing between form instances or end up writing a form validation and submission functionality from scratch.

Are you integrating the pubsub with react-hook-form or with formik? What about validation? Are you using a schema or is everything written in your application layer?



Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

cavemanbc423
•
2y ago
•
Edited 2y ago
Not really glue code, but its structure is totally usable and applicable. I create a store acts as single source of truth. Data related to the layer will be stored as a collection immutable. You can only modify its child. Come along is some predefined method that allows you to pubsub store.

I sync them across via a single source of data, the remaining i left it to hook form, validation will be handle at UI business layer, before going to components and after data got parsed and remapped. Everything will be separated at differents module. Each one is an independence project that can run alone and export API.

Communcation between components, i let the context do the rest. So it will be like this.

Service (Apis/middleman)

Module (each forms act as one module, they are all coming from a HoC, alike prototype)

Bussiness Layer. Catch context and handle them separately at each components layer. Also in charge of verify and send Data to Service / to Context to Services without the need of revalidate / sanitize

Component Layer, receive context, change state, update state within components (Isolated Presentation layer)
```

Another threads

```

I've worked with RHF extensively and have definitely hit some frustrating edge cases.

Dirty form checking: it's obviously dependent on the defaultValues but also on how you serialize the individual inputs' values on change and blur (most inputs yield empty strings, not things like undefined or null, but it depends whether you're using custom components or not). I hit some cases where focusing and blurring a field would result in marking it as dirty even though nothing changed. Eventually I resorted to manually counting the fields in dirtyFields with actual non-empty values associated to them.

Async default values: depends on the UX you're going for - but if you want to render the form with disabled fields while loading data and then change the defaultValues later on, you might run into issues since (per the docs), "defaultValues are cached on the first render within the custom hook. If you want to reset the defaultValues, you should use the reset api.". I ended up re-rendering the whole form when specifying defaultValues via a react key change instead of using the reset API as the docs mention.

Disabling form fields while submitting: RHF, helpfully, will send focus to the first field with an error after submission fails validation (which could be sync or async). A disabled input cannot be focused. Due to how I had structured things (I think, using context to send disabled to deeply nested form field components), that side effect within RHF was firing before react had re-rendered with non-disabled form fields which broke the auto-focus behavior. I had to resort to setting shouldFocusError: false and writing my own effect that basically did the same thing sadly.

There's probably a whole bunch more I could write but those were the things that immediately came to mind.

Lately I've been favoring zod over yup for its slightly improved TypeScript compatibility. I've also been itching to give https://github.com/unform/unform a shot.



Upvote
3

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
Thanks for your detailed comment!

I never encountered the dirty field issue/situation. But I imagine a controlled input with an "onChange" call written by us would solve the issue, just like you said.

For resetting the form with new "initial" values, I also used the "key" property instead of writing a use effect that resets the values inside the form. I like this approach more because it needs less code and fewer concepts are needed to understand the behaviour.

For the field focusing flow, I ended up with custom code myself but never had the opportunity of implementing a form that needed that in production (yet), only when teaching. Usually, the implementation requirements I tend to get from figma/ux designers have the submit button changed (disabled or replaced with a loading animation). Another hack that comes to mind right now is just adding a pointer-events none to the entire form while submitting, since that disabling of the inputs is a nice UX effect, not a major feature that should work in every situation.

I wonder if you used `zod` for conditional validation. I can't seem to find an equivalent to yup's `.wehn` anywhere
```

Another threads

```
rufio7777777
•
2y ago
I use react-hook-form regularly and sometimes struggle keeping more complex implementations clean. Long story short I would pay for this or watch this etc. especially if you give good clean code samples and video walk throughs etc. as an aside just to give more context we are almost always using graphql endpoints for the backend and querying them with Apollo



Upvote
3

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
Thanks for the feedback. I'm glad to see this level of interest.

I'll start a youtube channel soon and will post the videos related to react hook form for free there. I hope you'll drop o comment when I release them. Cheers!


Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

andriusainman
•
10mo ago
Forms in React unfortunately suck big time. In my own theory this is because forms are state machines in themselves and React puts another state machine on top, which just proves trouble in all sorts of ways, let alone the fact that you have to really know how to tame those things so that your computer doesn't start frying eggs due to the amount of VDOM diffing every time you touch a field. I just don't like forms in React. Yes I've encountered all sorts of problems and frustration. Back some time I've been using React Final Form which helps sorting out some of the re-rendering mayhem. Nowadays I'm building a vanilla JS library for building forms... I gave up React forms



Upvote
3

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
10mo ago
check my other posts out, I’ve made a few videos and posted about them here on reddit regarding forms. with RHF you don’t do vdom diffing by default, because you don’t control the values via React but rather let the browser handle them.


Upvote
1

Downvote
Reply
reply

Award
0 awards

Share
Share

u/Significant-Tap-3793 avatar
Significant-Tap-3793
•
6mo ago
worked with react forms and libraries for quite some time now, still dont like them, try and use uncontrolled as much as possible now. RHF is pretty good, along with joi for validation. One that really was a battle was zod for typescript validation, I consider myself a typescript expert, but f**k, the amount of hours wasted on that library were insane.


Upvote
3

Downvote
Reply
reply

Award
0 awards

Share
Share


For the first problem why did you need a custom context? Couldn't you have just read the data from the form's state? ( With a useField in formik and a useWatch in react-hook-form)



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
Two reasons:

I want to avoid running the render function for the entire form when updating the categories and/or subcategories. This is not a premature optimization. The project is written with React native, some of the fields components are not very high quality, and rendering them multiple times makes the form lag sometime.

I can separate code that deals with data fetching from code that deals with form presentation and validation. The form does not know anything about where to fetch data from. It just so happens that 2 wrapper/container components that wrap simple dropdowns are calling methods from the context and reading available values from there.

In larger teams, this discourages developers from adding additional state -> use effect ping pong code in the form, making it a bit easier to maintain over longer periods of time.

This is just my opinion. I did consider the keeping everything in the form too, but the data fetching separation need made me decide to move the orchestration outside the form. Then, because of the re-rendering issues (which could be fixed in 1-2 days of work by cleaning de field components up) I decided to add the context instead of passing props from the From Container/Wrapper, thru the form, all the day down to the dropdowns.
```

Another threads

```
[deleted]
[deleted]
•
2y ago
Have not used hook form, have used formik. We’ve been doing a lot with formik context providers and using formik context lately at work as we convert some forms to autosave. It’s brought out some neat patterns and some interesting, unexpected behavior from interactions with libraries like react-router and Apollo where we’ve accidentally had some crashing behavior that forced us to re-examine and redo autosave.


Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

KerberosKomondor
•
2y ago
I settled on react hook form with zod for validation. Generally really easy to use. Things only get a bit complicated when valid form states branch multiple times.



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
what do you mean by branching? A form can be valid in multiple configurations of values? So 2-3 objects containing different key:value pairs would all be considered valid forms?



Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

KerberosKomondor
•
2y ago
Sorry I forgot to respond. It's not really struggles but it's not as straightforward. I've found that creating an object for every valid form state and unioning them together works pretty well. There will be collectData boolean with two objects. One might be collectData: z.literal('false') and the other would be z.literal('true') with additional properties for the data being collected. This is really straightforward. It's when you get 2 of 3 branches in the data that I found it to be more difficult. Especially when a fork in valid form state has a fork below it.

The z.union and newer z.discriminatedUnion do a good job but the typings aren't quite good enough yet to simplify these more challenging forms. I do love that as Typescript gets better zod will for sure get better too.

```

Another threads

```
u/hovissimo avatar
hovissimo
•
2y ago
Not so much Formik, but Yup validation has fallen down on me.

My use case was validating the value of one field based on the nested value of another field.

We were trying to handle minimum and maximum price validations for international currencies, the formik data looked something like this:

{
    values: {
        minSalary: {
            value: 20000,
            currency: 'USD',
        },
        maxSalary: {
            value: 85000,
            currency: 'USD',
        },
    },
}
(We have to deal with international currency, so our constraint is that all Monies have to define an amount and a unit)

The validation rules we tried to implement were:

If both minSalary.value and maxSalary.value were not empty, then minSalary.currency and maxSalary.currency must be identical

minSalary.value must be less or equal to maxSalary.value

maxSalary.value must be greater or equal to minSalary.value (We have to have the redundant rule so that both fields turn red)

The whole problem is that Yup isn't actually a form validation tool, it's a schema validation tool - and it works recursively. This is a great performance optimization but it means that an object in the values is validated by a different schema (This is why you use yup.object().shape(), you're defining a new schema) with its own root. The validator inside the maxSalary schema can't see the values from minSalary and vice versa, they're evaluated independently.



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
This is an interesting problem, thanks for sharing. I'll give it a go right now: https://codesandbox.io/s/serene-smoke-osrluv?file=/src/CrossFieldValidationForm.tsx

Hm... it seems it is hard to clear the error of "minSalary" when changing maxSalary, and vice-versa. Such a situation might require additional help from a useEffect that reacts when min and max salaries update.

Another option for the values would be to create an error only on one of the fields (for example, only create a "minSalary value error).

For the currency, you could just have both dropdowns render the same value, so instead of having for fields, you have 3, two values and a currency. Maybe you can even show just one currency dropdown. But that falls in the area of responsibility of the UX/Design/Product team.



Upvote
2

Downvote
Reply
reply

Award
0 awards

Share
Share

u/hovissimo avatar
hovissimo
•
2y ago
Innnteresting. I combed Yup's docs looking for something like the way you used .test and scope.parent. I didn't think Yup supported that, I thought it was strictly top-down validation. Thanks for the example!

As you say, the real solution here is in design-space and that's how we solved it. We bullied the product team into only accepting a single currency on the parent model. As you can imagine, we didn't have to push very hard.
```
