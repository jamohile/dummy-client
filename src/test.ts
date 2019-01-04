import Data from "./Data";
import axios from 'axios';

const API = 'http://localhost:3000';


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

    static getURL() {
        return API + '/animals';
    }
}

async function main() {
    await Zoo.loadAll(Zoo);
    const zoo = Zoo.get(0, Zoo.prefix);

    console.dir(zoo.consolidate())
    console.dir('updating local')
    zoo.update({name: 'Metro'});
    console.dir(await zoo.flatten(true));
    const status = await zoo.save();
    console.dir(status);

    console.dir(zoo.get('name'))

}

main();


