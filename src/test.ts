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
        super(data, id);
        this.index();
    }
}

Animal.createTypeIndex();
Animal.createIndex('dangerous', (a: Animal) => {
    return a.getProp('dangerous')
})


async function main() {

    //Get and load a zoo.
    await Zoo.loadAll();
    const zoo = Zoo.get(0);

    // //Update and save a new name for the zoo.
    // zoo.update({name: 'Metro'});
    // const status = await zoo.save();
    //
    //
    // (await zoo.loadProp('animals'))[0].update({name: 'Zebra'}).save()
    //     .then(async () => console.dir(await zoo.flatten(true)))
    //
    // console.dir(Animal.getURL())

    //console.dir(await zoo.flatten(true));
    //console.dir(await zoo.loadProp('animals'))
    //Animal.getProp(3, Animal.prefix).update({dangerous: false})

    await Animal.loadAll()
    console.dir(await Animal.searchIndexAndGetOrLoad('dangerous', false))
}

main();


