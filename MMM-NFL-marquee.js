/* global Module Log moment config */

/* Magic Mirror
 * Module: MMM-NFL
 *
 * By fewieden https://github.com/fewieden/MMM-NFL
 * MIT Licensed.
 */

Module.register('MMM-NFL', {

    modes: {
        P: 'Pre-Season', // still a work in progress
        R: 'Regular-Season',
        POST: 'Post-Season' // also still working on, currently will show the games
    },

    details: {
        y: (new Date()).getFullYear(),
        t: 'R'
    },

    states: {
        1: '1ST_QUARTER',
        2: '2ND_QUARTER',
        3: '3RD_QUARTER',
        4: '4TH_QUARTER',
        H: 'HALF_TIME',
        OT: 'OVER_TIME',
        F: 'FINAL',
        FO: 'FINAL_OVERTIME',
        T: 'TIE',
        P: 'UPCOMING'
    },

    renamedTeams: {
        LA: 'LAR' // changes the LA Rams from LA to LAR
    },

    defaults: {
        colored: true,
        helmets: false,
        focus_on: false,
        format: 'ddd h:mm', // shows date and time of upcoming games as: Sunday @ 12:00
        reloadInterval: 30 * 60 * 1000,  // every 30 minutes
        reverseTeams: true // changes teams to show Home team second IE: LAR @ KC
    },

    statistics: false,
    help: false,

    voice: {
        mode: 'FOOTBALL',
        sentences: [
            'OPEN HELP',
            'CLOSE HELP',
            'SHOW HELMETS',
            'SHOW LOGOS',
            'COLOR ON',
            'COLOR OFF',
            'SHOW PASSING YARDS STATISTIC',
            'SHOW RUSHING YARDS STATISTIC',
            'SHOW RECEIVING YARDS STATISTIC',
            'SHOW TACKLES STATISTIC',
            'SHOW SACKS STATISTIC',
            'SHOW INTERCEPTIONS STATISTIC',
            'HIDE STATISTIC'
        ]
    },

    getTranslations() {
        return {
            en: 'translations/en.json',
            de: 'translations/de.json'
        };
    },

    getScripts() {
        return ['moment.js'];
    },

    getStyles() {
        return ['font-awesome.css', 'MMM-NFL-marquee.css'];
    },

    start() {
        Log.info(`Starting module: ${this.name}`);
        this.sendSocketNotification('CONFIG', this.config);
        moment.locale(config.language);
    },

    notificationReceived(notification, payload, sender) {
        if (notification === 'ALL_MODULES_STARTED') {
            this.sendNotification('REGISTER_VOICE_MODULE', this.voice);
        } else if (notification === 'VOICE_FOOTBALL' && sender.name === 'MMM-voice') {
            this.checkCommands(payload);
        } else if (notification === 'VOICE_MODE_CHANGED' && sender.name === 'MMM-voice' && payload.old === this.voice.mode) {
            this.help = false;
            this.statistics = false;
            this.updateDom(1000);
        }
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'SCORES') {
            this.scores = payload.scores;
            this.details = payload.details;
            this.updateDom(1000);
        } else if (notification === 'STATISTICS') {
            this.help = false;
            this.statistics = payload;
            this.updateDom(1000);
        }
    },

    checkCommands(data) {
        if (/(HELP)/g.test(data)) {
            if (/(CLOSE)/g.test(data) || (this.help && !/(OPEN)/g.test(data))) {
                this.help = false;
            } else if (/(OPEN)/g.test(data) || (!this.help && !/(CLOSE)/g.test(data))) {
                this.statistics = false;
                this.help = true;
            }
        } else if (/(HELMETS)/g.test(data)) {
            this.config.helmets = true;
        } else if (/(LOGOS)/g.test(data)) {
            this.config.helmets = false;
        } else if (/(COLOR)/g.test(data)) {
            if (/(OFF)/g.test(data) || (this.config.colored && !/(ON)/g.test(data))) {
                this.config.colored = false;
            } else if (/(ON)/g.test(data) || (!this.config.colored && !/(OFF)/g.test(data))) {
                this.config.colored = true;
            }
        } else if (/(STATISTIC)/g.test(data)) {
            if (/(HIDE)/g.test(data)) {
                this.statistics = false;
            } else if (/(PASSING)/g.test(data)) {
                this.sendSocketNotification('GET_STATISTICS', 'Passing Yards');
            } else if (/(RUSHING)/g.test(data)) {
                this.sendSocketNotification('GET_STATISTICS', 'Rushing Yards');
            } else if (/(RECEIVING)/g.test(data)) {
                this.sendSocketNotification('GET_STATISTICS', 'Receiving Yards');
            } else if (/(TACKLES)/g.test(data)) {
                this.sendSocketNotification('GET_STATISTICS', 'Tackles');
            } else if (/(SACKS)/g.test(data)) {
                this.sendSocketNotification('GET_STATISTICS', 'Sacks');
            } else if (/(INTERCEPTIONS)/g.test(data)) {
                this.sendSocketNotification('GET_STATISTICS', 'Interceptions');
            }
        }
        this.updateDom(1000);
    },

    getDom() {
        const wrapper = document.createElement('div');
        const scores = document.createElement('div');

        const header = document.createElement('header');
        // shows header with season mode and week #
        header.innerHTML = `NFL ${this.modes[this.details.t] || this.details.t} ${this.details.y} - Week ${this.details.w}`;
        scores.appendChild(header);

        if (!this.scores) {
            const text = document.createElement('div');
            text.innerHTML = this.translate('LOADING');
            text.classList.add('dimmed', 'light');
            scores.appendChild(text);
        } else {
            const boxScore = document.createElement('boxScore');
            boxScore.classList.add('xxlarge', 'bold', 'boxScore');

            //boxScore.appendChild(this.createLabelRow());

            for (let i = 0; i < this.scores.length; i += 1) {
                this.appendDataRow(this.scores[i].$, boxScore);
            }

            if (Array.isArray(this.config.focus_on)) {
                for (let i = 0; i < this.config.focus_on.length; i += 1) {
                    let hasMatch = false;
                    for (let n = 0; n < this.scores.length; n += 1) {
                        if (this.config.focus_on[i] === this.scores[n].$.h ||
                            this.config.focus_on[i] === this.scores[n].$.v) {
                            hasMatch = true;
                            break;
                        }
                    }
                    if (!hasMatch) {
                        this.appendByeWeek(this.config.focus_on[i], boxScore);
                    }
                }
            }

            scores.appendChild(boxScore);

            const modules = document.querySelectorAll('.module');
            for (let i = 0; i < modules.length; i += 1) {
                if (!modules[i].classList.contains('MMM-NFL')) {
                    if (this.statistics || this.help) {
                        modules[i].classList.add('MMM-NFL-blur');
                    } else {
                        modules[i].classList.remove('MMM-NFL-blur');
                    }
                }
            }

            if (this.statistics || this.help) {
                scores.classList.add('MMM-NFL-blur');
                const modal = document.createElement('div');
                modal.classList.add('modal');
                if (this.statistics) {
                    this.appendStatistics(modal);
                } else {
                    this.appendHelp(modal);
                }
                wrapper.appendChild(modal);
            }
        }

        wrapper.appendChild(scores);

        return wrapper;
    },

    createLabelRow() {
        const labelRow = document.createElement('tr');

        const dateLabel = document.createElement('th');
        const dateIcon = document.createElement('i');
        dateIcon.classList.add('fa', 'fa-calendar');
        dateLabel.appendChild(dateIcon);
        labelRow.appendChild(dateLabel);

        const firstLabel = document.createElement('th');
        firstLabel.innerHTML = this.translate(this.config.reverseTeams ? 'AWAY' : 'HOME');
        firstLabel.setAttribute('colspan', 3);
        labelRow.appendChild(firstLabel);

        const vsLabel = document.createElement('th');
        vsLabel.innerHTML = '';
        labelRow.appendChild(vsLabel);

        const secondLabel = document.createElement('th');
        secondLabel.innerHTML = this.translate(this.config.reverseTeams ? 'HOME' : 'AWAY');
        secondLabel.setAttribute('colspan', 3);
        labelRow.appendChild(secondLabel);

        return labelRow;
    },

    appendDataRow(data, appendTo) {
        if (!this.config.focus_on || this.config.focus_on.indexOf(data.h) !== -1 ||
            this.config.focus_on.indexOf(data.v) !== -1) {
            const row = document.createElement('span');
            row.classList.add('row');

            const firstTeam = document.createElement('td');
            firstTeam.classList.add('align-right');
            this.appendBallPossession(data, true, firstTeam);
            const firstTeamSpan = document.createElement('span');
            firstTeamSpan.innerHTML = this.getTeamName(data[this.config.reverseTeams ? 'v' : 'h']) + "&nbsp;";
            firstTeam.appendChild(firstTeamSpan);
            row.appendChild(firstTeam);

            const firstLogo = document.createElement('td');
            firstLogo.appendChild(this.createIcon(data[this.config.reverseTeams ? 'v' : 'h'])) + "&nbsp;";
            row.appendChild(firstLogo);

            const firstScore = document.createElement('td');
            firstScore.innerHTML = "<font color=#0080ff>" + data[this.config.reverseTeams ? 'vs' : 'hs'] + "</font>";
            row.appendChild(firstScore);

            const vs = document.createElement('td');
            vs.setAttribute('style', 'font color:#FF0000');
            vs.innerHTML = "<font color=#ffffff>&nbsp;&nbsp; @ &nbsp;&nbsp;</font>";
            row.appendChild(vs);

            const secondScore = document.createElement('td');
            secondScore.innerHTML = "<font color=#0080ff>" + data[this.config.reverseTeams ? 'hs' : 'vs'] + "&nbsp;" + "</font>";
            row.appendChild(secondScore);

            const secondLogo = document.createElement('td');
            secondLogo.appendChild(this.createIcon(data[this.config.reverseTeams ? 'h' : 'v'], true)) + "&nbsp;";
            row.appendChild(secondLogo);

            const secondTeam = document.createElement('td');
            secondTeam.classList.add('align-left');
            const secondTeamSpan = document.createElement('span');
            secondTeamSpan.innerHTML = this.getTeamName(data[this.config.reverseTeams ? 'h' : 'v']);
            secondTeam.appendChild(secondTeamSpan);
            this.appendBallPossession(data, false, secondTeam);
            row.appendChild(secondTeam);

            const date = document.createElement('td');
            if (data.q in ['1', '2', '3', '4', 'H', 'OT']) {
                const quarter = document.createElement('div');
                quarter.innerHTML = "<font color=#ff8000>" + '&nbsp;&nbsp;' + this.translate(this.states[data.q]) + "</font>";
                if (Object.prototype.hasOwnProperty.call(data, 'k')) {
                    quarter.classList.add('live');
                    date.appendChild(quarter);
                    const time = document.createElement('div');
                    time.classList.add('live');
                    time.innerHTML = "<font color=#ff8000>" + '&nbsp;&nbsp;' + `${data.k} ${this.translate('TIME_LEFT')}` + "</font>";
                    date.appendChild(time);
                } else {
                    date.appendChild(quarter);
                }
            } else if (data.q === 'P') {
                date.innerHTML = "<font color=#ff8000>" + '&nbsp;&nbsp;' + moment(data.starttime).format(this.config.format) + "</font>";
            } else {
                date.innerHTML = "<font color=#ff8000>" + '&nbsp;&nbsp;' + this.translate(this.states[data.q]) + "</font>";
            }
            row.appendChild(date);

            const separator = document.createElement('td');
            separator.innerHTML = "&nbsp;&nbsp;<img class = image src=./modules/MMM-NFL/icons/nfl.png>&nbsp;&nbsp;";
            row.appendChild(separator);

            appendTo.appendChild(row);
        }
    },

    getTeamName(name) {
        if (this.renamedTeams.hasOwnProperty(name)) {
            return this.renamedTeams[name];
        }
        return name;
    },

    appendBallPossession(data, homeTeam, appendTo) {
        const team = homeTeam ? data.h : data.v;
        if (data.p === team) {
            const ballIcon = document.createElement('img');
            ballIcon.src = this.file('icons/football.png');
            if (homeTeam) {
                ballIcon.classList.add('ball-home');
            } else {
                ballIcon.classList.add('ball-away');
            }
            if (data.rz === '1') {
                ballIcon.classList.add('redzone');
            }
            appendTo.appendChild(ballIcon);
        }
    },

    appendByeWeek(teamName, appendTo) {
        const row = document.createElement('tr');
        row.classList.add('row');

        const date = document.createElement('td');
        date.innerHTML = `${this.translate('WEEK')} ${this.details.w}`;
        row.appendChild(date);

        const team = document.createElement('td');
        team.innerHTML = teamName;
        row.appendChild(team);

        const logo = document.createElement('td');
        logo.appendChild(this.createIcon(teamName));
        row.appendChild(logo);

        const byeWeek = document.createElement('td');
        byeWeek.setAttribute('colspan', 5);
        byeWeek.classList.add('align-left');
        byeWeek.innerHTML = this.translate('BYE_WEEK');
        row.appendChild(byeWeek);

        appendTo.appendChild(row);
    },

    appendStatistics(appendTo) {
        const type = document.createElement('div');
        type.classList.add('large');
        type.innerHTML = this.statistics.type;
        appendTo.appendChild(type);

        const boxScore = document.createElement('boxScore');
        boxScore.classList.add('medium', 'boxScore');

        const labelRow = document.createElement('tr');

        const posLabel = document.createElement('th');
        posLabel.innerHTML = '#';
        labelRow.appendChild(posLabel);

        const playerLabel = document.createElement('th');
        playerLabel.innerHTML = this.translate('PLAYER');
        labelRow.appendChild(playerLabel);

        const teamLabel = document.createElement('th');
        teamLabel.setAttribute('colspan', 2);
        teamLabel.innerHTML = this.translate('TEAM');
        labelRow.appendChild(teamLabel);

        const unitLabel = document.createElement('th');
        unitLabel.innerHTML = this.statistics.data.unit;
        labelRow.appendChild(unitLabel);

        boxScore.appendChild(labelRow);

        for (let i = 0; i < this.statistics.data.players.length; i += 1) {
            const row = document.createElement('tr');
            row.classList.add('row');

            const position = document.createElement('td');
            position.innerHTML = this.statistics.data.players[i].position;
            row.appendChild(position);

            const player = document.createElement('td');
            player.classList.add('align-left');
            player.innerHTML = this.statistics.data.players[i].player;
            row.appendChild(player);

            if (this.config.focus_on && this.config.focus_on.indexOf(this.statistics.data.players[i].team) !== -1) {
                row.classList.add('bright');
            }

            const teamName = document.createElement('td');
            teamName.innerHTML = this.statistics.data.players[i].team;
            row.appendChild(teamName);

            const team = document.createElement('td');
            team.appendChild(this.createIcon(this.statistics.data.players[i].team));
            row.appendChild(team);

            const value = document.createElement('td');
            value.innerHTML = this.statistics.data.players[i].value;
            row.appendChild(value);

            boxScore.appendChild(row);
        }

        appendTo.appendChild(boxScore);
    },

    appendHelp(appendTo) {
        const title = document.createElement('h1');
        title.classList.add('medium');
        title.innerHTML = `${this.name} - ${this.translate('COMMAND_LIST')}`;
        appendTo.appendChild(title);

        const mode = document.createElement('div');
        mode.innerHTML = `${this.translate('MODE')}: ${this.voice.mode}`;
        appendTo.appendChild(mode);

        const listLabel = document.createElement('div');
        listLabel.innerHTML = `${this.translate('VOICE_COMMANDS')}:`;
        appendTo.appendChild(listLabel);

        const list = document.createElement('ul');
        for (let i = 0; i < this.voice.sentences.length; i += 1) {
            const item = document.createElement('li');
            item.innerHTML = this.voice.sentences[i];
            list.appendChild(item);
        }
        appendTo.appendChild(list);
    },

    createIcon(team, flip = false) {
        const teamIcon = document.createElement('img');
        teamIcon.src = this.file(`icons/${team}${this.config.helmets ? '_helmet' : ''}.png`);
        if (!this.config.colored) {
            teamIcon.classList.add('icon');
        }
        if (flip && this.config.helmets) {
            teamIcon.classList.add('away');
        }
        return teamIcon;
    }
});
