<img src="./dummy.png" alt="Dummy.png" width="200"/>

# Dummy | Client


## What is Dummy?
Dummy is a new approach to client-side data management. 
It takes care of CRUD, normalization, updating, version history, and more, so you don't have to.

## How does it work?
Dummy's is designed to be <b>simple and flexible</b>. It gives you power and choice when you want it, 
and doesn't shove it on you when you don't.

### Getting Started
Dummy is based on object oriented data. Each object of data contains some relevant properties, and perhaps <i>relations</i> to other objects.

Furthermore, Dummy believes that if relational data is redundant, it should not be repeated
during transfer, and should instead be normalized.

That is, say you have a post with two comments by the same user.
```$xslt
{
    post:{
        comments: [
            {
                id: 1,
                body: "Here's a comment!"
                user: {
                    id: 1,
                    name: 'John Doe',
                    email: 'jdoe@example.com'
                }
            },
            {
                id: 2,
                body: "Here's another one!"
                user: {
                    id: 1,
                    name: 'John Doe',
                    email: 'jdoe@example.com'
                }
            }
        ]
    }
}
```
We can see that quite a bit of information is duplicated. Dummy (in principle), normalizes the structure.

```$xslt
{
    post:{
        comments: [1,2]
    }
    comments:[
            {
                id: 1,
                body: "Here's a comment!"
                user: 1
            },
            {
                id: 2,
                body: "Here's another one!"
                user: 1
            }
    ],
    users: [
        {
            id: 1,
            name: 'John Doe',
            email: 'jdoe@example.com'
        }
    ]
}
```

Keep in mind that this is just to illustrate the structure of normalization.
In reality, whether each of those components (post, comments, users) is sent together
or via seperate requests is a seperate decision. The above is a server side send, Dummy manages the client to interact with a properly normalized server.

#### Benefits of This Approach 
<ul>
    <li>Ease of updating: cascading changes through relations is unecessary.</li>
    <li>Complex nested data can involve complicated queries on the server-side, Dummy eliminates this. </li>
</ul>

### Implementation
 
#### Creating a Data Type
It all starts with the ```Data``` class. This provides almost all Dummy operations.
To create an object, extend the data class. Say we'd like to create a class for different types of animals.

We want to store three properties: 
<ul>
    <li>name</li>
    <li>colour</li>
    <li>whether it is dangrous</li>
</ul>


```
import Data from 'dummy-client';

const API = 'http://localhost:3000';

class Animal extends Data<Animal> {
    static prefix = 'animals';
    
    propTypeMap = {
        name: 'string',
        colour: 'string',
        dangerous: 'boolean'
    }

    static getURL() {
        return API + '/animals';
    }
}
```

This is the simplest way to define a new object. 

We give it a unique prefix, which helps Dummy store an sort object internally. Using a unique prefix
means that two items of different types can have the same id.

Secondly, we set a propTypeMap. This defines the various data properties this object contains. 
For this example, no properties are referential.

**Optional:**
And finally, we override `static getURL()`.This tells Dummy the fully qualified URL root for objects of this type.
*IF* you do not provide an override, Dummy will assume that the url is that of the root api plus the prefix.

If you do not override, make sure you have called `Data.setAPI(api)` before creating any objects.

#### Working with data
We'd like to add a bear using the ```Animal``` class above. We can do it as follows:
```$xslt
const data = {name: 'Bear', colour: 'Brown', dangerous: true}
const bear = new Animal(data).add()
```
In this example, we know what data we'd like. We create a new Animal and use .add() to add it to the local store.
Notice that we don't pass in an <b>id</b>. When creating a new item, we don't want to accidentally overwrite existing items,
so Dummy automatically assigns an id.

Let's say we want to change this data, we realize bears aren't so dangerous after all!
```$xslt
bear.update({dangerous: false})
```
It's as simple as that! We can update as many properties as we'd like simultaneously.

Uh oh, maybe bears are actually dangerous. No worries! We can revert our data.
```$xslt
bear.revert()
```
Data can be reverted until it is committed. At that point, it can no longer have updates removed.
```
bear.commit()
```
Let's say we have a remote server, chances are we'd like to save our new data to the server.
```$xslt
bear.save()
```
Saving is asynchronous and returns a promise. To deal with this, we can either use async/await or Promise style callbacks.
```$xslt
const result = await bear.save()
//result = {successful: boolean, status: number}

OR

bear.save()
    .then(result => {})
    .catch(err => {})
```

#### Non-local objects
In the example above, we knew the data we wanted, and created a new idea.
What if instead, we have a remote server which can give us data? Using the above example, 
let's assume we have the ```Animal``` type and a webserver that will reply at http://path/to/api/animals.

Without creating the bear animal, we can call:
```$xslt
Animal.loadAll()
```
Dummy will dispatch an API call to the endpoint specifified by ```Animal.getURL()```
and populate data from there. A response is expected in the following structure:
```json
[
  {
    "id": 2,
    "name": "Zebra",
    "colour": "white",
    "dangerous": false
  },
  {
    "id": 3,
    "name": "Bear",
    "colour": "brown",
    "dangerous": true
  },
  {
    "id": 4,
    "name": "Dog",
    "colour": "gold",
    "dangerous": false
  },
  {
    "id": 5,
    "name": "Lion",
    "colour": "orange",
    "dangerous": true
  }
]
```
<b>REMEMBER</b>
Dummy is built with flexibility in mind. Although this is the default response structure dummy expects, you can modify dummy to accept whatever structure you prefer.
The only rule is that your response structure should remain consistent across all API resources, 
but that's just good practice! Before creating any objects, call the following to configure a new structure. Your function should take in the API's data response, data, and return usable data for Dummy. 
The returned data should either be an object with your properties at its root, or an array of the same.
```$xslt
Data.setResponseDataMapping((data) => {
    return /*Something */
});
```
#### Relations
Let's say we run a zoo, and this zoo has many animals. We may create a new class, ```Zoo```.
```$xslt
class Zoo extends Data<Zoo> {
    static prefix = 'zoo';
    
    propTypeMap = {
        name: 'string',
        animals: [Animal]
    }
}
```
Notice how similar it is to the ```Animal``` class! Also, notice how we define ```animals```
in the propTypeMap. ```Animal``` appears in brackets. This tells Dummy that this is a one to many relationship, 
and to expect an array of ids.

Let's say that somewhere in our application we know that there is a Zoo of id 2, but we don't know its data.

```$xslt
const zoo = new Zoo(undefined, 2).add();
await zoo.load();
```

Just like that, Dummy will contact your server to load the zoo. In response, it may be expecting something like this:
```$xslt
{
    id: 2,
    name: 'Metro Toronto Zoo',
    animals: [2,3,4]
}
```

Generally speaking, this is discouraged unless you know what you are doing.
Loading all zoos ahead of time with ```Zoo.load(Zoo)``` is probably more efficient than seperate requests.
Let's say we want to print out to contents of our zoo. We can call:
```$xslt
console.dir( zoo.consolidate() )
```
By consolidating the object, we merge its committed properties with its locally updated ones.
Here, we haven't performed any local updates, and server data is automatically committed. 

However, Dummy gives us another way to get an object's data. Notice that ```consolidate()``` is synchronous, ```flatten()``` is async.
```$xslt
flatten(pure: boolean, maxDepth: number)
```

With no parameters, flatten works just like consolidate, but async.

```
console.dir( await zoo.flatten() )
// prints:
{
    id: 2,
    name: 'Metro Toronto Zoo',
    animals: [2,3,4]
}
```

If ```pure``` is true, however, flatten becomes very useful. Notice that above, animals is an array of ids.
Flatten will replace these ids with data for these objects. If needed, 
Dummy will even make API calls to get this data.

```
console.dir( await zoo.flatten() )
// prints:
{
    id: 2,
    name: 'Metro Toronto Zoo',
    animals: [
        {
            "id": 2,
            "name": "Zebra",
            "colour": "white",
            "dangerous": false
          },
          ...
    ]
}
```

This is particularly useful when allowing UI views to simply consume data without worrying about APIs and requests.
Notice that ```animals``` was a root level (level 1) property. By using the second property of flatten, ```maxDepth```, you 
can control how many levels down data will be expanded. For example, with a maxDepth of 1, any relational ids in each animal would remain ids, 
but with a maxDepth of 2 they too would be expanded.

Let's say we want to get a list of Animal objects from our zoo. That's as simple as calling:

```$xslt
const animals = zoo.get('animals');
```

Now, using get will not load the objects.
But you can easily use forEach and Promise.all() to load each object!
In fact, we like you. <b>So we did that for you. </b>
```$xslt
const responses = await Data.loadAll(zoo.get('animals'))
```
responses will be a promise of status objects.

Alternatively, you can just do
```$xslt
await Data.loadAll(zoo.get('animals'))

or 

Data.loadAll(zoo.get('animals'))
    .then(statuses => {})
```

<b>But wait! There's more! Cliche enough?</b>

Remember that Dummy is about flexibility. Instead of ``zoo.get(prop)``
we can use the asynchronous `zoo.load(prop)`. If the property is an array of objects,
it will load each object before returning an array of the objects  <i>NOT the statuses</i>.

If the prop is a single object, it will load and return that object. If the prop is a primitive, it will simply return that primitive.
```
const animals = await zoo.loadProp('animals')
//animals is of type Animal[]
```
