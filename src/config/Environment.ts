class Environment {
    VITE_API_HOST: string;

    constructor() {
        this.VITE_API_HOST = import.meta.env.VITE_API_HOST;
    }
}

const environment = new Environment();

export default environment;