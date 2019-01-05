import Data from "./Data";
import axios from 'axios';

const API = 'http://localhost:3000';

Data.setAPI(API)

class Zoo extends Data<Zoo> {
    propTypeMap = {
        name: 'string',
        animals: [Animal]
    }
    static prefix = 'zoos';

    constructor(data, id) {
        super({data, id, type: Zoo});
    }

    static getURL() {
        return API + '/zoos';
    }
}


class Animal extends Data<Animal> {
    propTypeMap = {
        name: 'string',
        colour: 'string',
        dangerous: 'boolean'
    }
    static prefix = 'animals'

    constructor(data, id) {
        super({data, id, type: Animal});
    }
}

async function main() {

    //Get and load a zoo.
    await Zoo.loadAll(Zoo);
    const zoo = Zoo.get(0, Zoo.prefix);

    //Update and save a new name for the zoo.
    zoo.update({name: 'Metro'});
    const status = await zoo.save();


    (await zoo.loadProp('animals'))[0].update({name: 'Zebra'}).save()
        .then(async () => console.dir(await zoo.flatten(true)))

    console.dir(Animal.getURL())

}

main();


