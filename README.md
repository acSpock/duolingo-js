# duolingo-js
Unofficial Duolingo API for browser and nodejs. This repo is heavily inspired by the Unofficial Python API found [here](https://github.com/KartikTalwar/Duolingo). Credit to those folks. All http requests to duolingo return promises. Please read the documentation to find out which are and which are not promises.

I just started this wrapper for a side project. I will be updating it as I go.

## Installation

install with npm

```bash
npm install duolingo-js
```

## Usage

```javascript
import Duolingo from "duolingo-js";
const duo = new Duolingo({userName:'acspock', password:'password'});

duo.logIn()
    .then((result) => {
        duo.getData()
            .then(data => {
                //use returned data or use userData on duo instance
                console.log(duo.userData)
            })
            .catch(e => {
                //handle error
             });
    })
    .catch();
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
