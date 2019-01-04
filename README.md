# Dummy Client

## What is Dummy?
Dummy is a new approach to client-side data management. 
It takes care of CRUD, normalization, updating, version history, and more, so you don't have to.

## How does it work?
Dummy's is designed to be <b>simple and flexible </b>. It gives you power and choice when you want it, 
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
or via seperate requests is a seperate decisions.

#### Benefits of This Approach 
<ul>
    <li>Ease of updating: cascading changes through relations is unecessary.</li>
</ul>

### Implementation
 
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

    constructor(data, id) {
        super({data, id, type: Animal});
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

Next, we override the constructor. The constructor must contain the same props and super call, in the exact same order!

And finally, we must override getURL. This tells Dummy the fully qualified URL root for objects of this type.



