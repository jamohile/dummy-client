import {Data} from "./Data";
import axios from 'axios';

const API = 'https://9557f302-ed12-4691-91e6-e63d76a75472.mock.pstmn.io';

class Animal extends Data<Animal> {
    propTypeMap = {
        name: 'string'
    }

    constructor(props) {
        super({...props, type: Animal});
    }

    static getURL() {
        return API + '/animals';
    }

    static getAll(): Animal[] {
        return Data.getAll(Animal);
    }

    static async loadAll() {
        return await Data.loadAll(Animal);
    }
}

class Zoo extends Data<Zoo>{
    propTypeMap = {
        animals: [Animal]
    }
    constructor(props) {
        super({...props, type: Zoo});
    }
}


async function main() {
    const zoo = new Zoo({data: {animals: [0,1,2]}, id: 5});
    const status = await Animal.loadAll();

    console.dir(await zoo.flatten(true))
}

main();


