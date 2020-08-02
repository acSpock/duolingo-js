# duolingo-js
Unofficial Duolingo API for browser and nodejs. This repo is heavily inspired by the Unofficial Python API found [here](https://github.com/KartikTalwar/Duolingo). Credit to those folks. All http requests to duolingo return promises. Please read the documentation to find out which are and which are not promises.

I just started this wrapper for a side project. I will be updating the README and project  as I go.

Make sure you use "type": "module" in your package.json

## Installation

install with npm

```bash
npm install duolingo-api-js
```

## Usage

```javascript
import Duolingo from "duolingo-api-js";
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
## Documentation
###### Methods
- [Login](#login)
- [Get Data](#get-data)
- [Get Languages](#get-languages)
- [Switch Language](#switch-language)
- [Get User Data](#get-user-data)
- [Get Skills](#get-skills)
- [Get Learned Skills](#get-learned-skills)
- [Get Learned Words](#get-learned-words)
- [Get Related Words](#get-related-words)
- [Get Known Topics](#get-known-topics)
- [Get User Data Keys](#get-user-data-keys)
- [Is Current Language](#current-language)

#### Get User Information
`duo.logIn()`

Logs a user in
```javascript
// Sample Request
duo.logIn()
    .then( data => {
        console.log('data', data);
    })
    .catch();

// Sample Response
 { response: 'OK', username: 'acspock', user_id: '11111' }
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
