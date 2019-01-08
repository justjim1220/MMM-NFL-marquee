# MMM-NFL-marquee

a scrolling version of the NFL box scores modified from @fewieden's MMM-NFL a 3<sup>rd</sup> Party Module for MagicMirror<sup>2</sup> <br> (currently supported by pc devices other than RasPi, works with Windows and Ubuntu)

## Example

![](.github/Screenshot (12).png)
![](.github/Screenshot (13).png)
![](.github/Screenshot (14).png)
![](.github/Screenshot (15).png)
![](.github/Screenshot (16).png)
![](.github/Screenshot (17).png)

## Dependencies

* An installation of [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror)
* OPTIONAL: [Voice Control](https://github.com/fewieden/MMM-voice)
* npm
* [request](https://www.npmjs.com/package/request)
* [xml2js](https://www.npmjs.com/package/xml2js)
* [jsdom](https://www.npmjs.com/package/jsdom)
* [moment-timezone](https://www.npmjs.com/package/moment-timezone)

## Installation

1. Clone this repo into `~/MagicMirror/modules` directory.
1. Configure your `~/MagicMirror/config/config.js`:

    ```
    {
        module: "MMM-NFL-marquee",
        position: "top_bar", // works best in top or bottom bar
        config: {
            colored: true,
            helmets: false,
            focus_on: false,
            format: "ddd h:mm", // shows date and time of upcoming games as: Sunday @ 12:00
            reloadInterval: 30 * 60 * 1000,  // every 30 minutes
            reverseTeams: true // changes teams to show Home team second IE: LAR @ KC
        }
    },
    ```

1. Run command `npm install --productive` in `~/MagicMirror/modules/MMM-NFL` directory.

## Config Options

| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `colored` | `false` | Remove black/white filter of logos/helmets. |
| `helmets` | `false` | Show helmets instead of logo. |
| `focus_on` | `false` | Display only matches with teams of this array e.g. `['NYG', 'DAL', 'NE']`. |
| `format` | `'ddd h:mm'` | In which format the date should be displayed. [All Options](http://momentjs.com/docs/#/displaying/format/) |
| `reloadInterval` | `30 * 60 * 1000` (30 mins) | How often should the data be fetched |
| `reverseTeams` | `true` | Changes teams to show Home team second IE: LAR @ KC

## OPTIONAL: Voice Control

This module supports voice control by [MMM-voice](https://github.com/fewieden/MMM-voice). In order to use this feature, it's required to install the voice module. There are no extra config options for voice control needed.

### Mode

The voice control mode for this module is `FOOTBALL`

### List of all Voice Commands

* OPEN HELP -> Shows the information from the readme here with mode and all commands.
* CLOSE HELP -> Hides the help information.
* SHOW HELMETS -> Switch team logos to helmets. (Effect stays until your mirror restarts, for permanent change you have to edit the config)
* SHOW LOGOS -> Switch team helmets to logos. (Effect stays until your mirror restarts, for permanent change you have to edit the config)
* COLOR ON -> Switch color for team logos/helmets on. (Effect stays until your mirror restarts, for permanent change you have to edit the config)
* COLOR OFF -> Switch color for team logos/helmets off. (Effect stays until your mirror restarts, for permanent change you have to edit the config)
* SHOW PASSING YARDS STATISTIC -> Shows statistic of Top 5 passing players.
* SHOW RUSHING YARDS STATISTIC -> Shows statistic of Top 5 rushing players.
* SHOW RECEIVING YARDS STATISTIC -> Shows statistic of Top 5 receiving players.
* SHOW TACKLES STATISTIC -> Shows statistic of Top 5 tackling players.
* SHOW SACKS STATISTIC -> Shows statistic of Top 5 sacking players.
* SHOW INTERCEPTIONS STATISTIC -> Shows statistic of Top 5 intercepting players.
* HIDE STATISTIC -> Hide statistic informations
