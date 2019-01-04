import {Data} from "./Data";
import axios from 'axios';

const API = 'http://localhost:3000';

class Zoo extends Data<Zoo> {
    propTypeMap = {
        lazyAnimal: Animal,
        mainAnimal: Animal,
        pens: [Pen]
    }
    static prefix = 'zoos';

    constructor(data, id) {
        super({data, id, type: Zoo});
    }

    static getURL() {
        return API + '/zoos';
    }
}

class Pen extends Data<Pen> {
    propTypeMap = {
        animals: [Animal]
    }
    static prefix = 'pens';

    constructor(data, id) {
        super({data, id, type: Pen});
    }

    static getURL() {
        return API + '/pens';
    }
}


class Animal extends Data<Animal> {
    propTypeMap = {
        name: 'string'
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
    const zoo = new Zoo(undefined, 0).add();
    await zoo.load();
    console.dir(await zoo.flatten(true, 3));
    console.dir(zoo.type.REGISTRY)

}

main();


