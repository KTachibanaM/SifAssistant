var AccountsPage = React.createClass({
    getInitialState: function() {
        return {
            accounts: [
                {
                    alias: "test1",
                    level: 5,
                    exp: 23,
                    lp: 4, // Changing per second
                    next_lp: 6 * 60 * 1000, // Changing per second
                    love_gems: 233
                },
                {
                    alias: "test2",
                    level: 100,
                    exp: 2333,
                    lp: 70, // Changing per second
                    next_lp: 6 * 60 * 1000, // Changing per second
                    love_gems: 0
                },
                {
                    alias: "test3",
                    level: 5,
                    exp: 23,
                    lp: 4, // Changing per second
                    next_lp: 6 * 60 * 1000, // Changing per second
                    love_gems: 233
                },
                {
                    alias: "test4",
                    level: 100,
                    exp: 2333,
                    lp: 70, // Changing per second
                    next_lp: 6 * 60 * 1000, // Changing per second
                    love_gems: 0
                },
                {
                    alias: "test5",
                    level: 5,
                    exp: 23,
                    lp: 4, // Changing per second
                    next_lp: 6 * 60 * 1000, // Changing per second
                    love_gems: 233
                },
                {
                    alias: "test6",
                    level: 100,
                    exp: 2333,
                    lp: 70, // Changing per second
                    next_lp: 6 * 60 * 1000, // Changing per second
                    love_gems: 0
                }
            ]
        }
    },
    componentDidMount: function () {
        var that = this;
        var intervals = this.state.accounts.map((account, index) => {
            return setInterval(function () {
                var newState = that.state;
                newState.accounts[index].next_lp -= 1000;
                that.setState(newState);
            }, 1000);
        });
        var newState = this.state;
        newState.intervals = intervals;
        this.setState(newState);
    },
    componentWillUnmount: function() {
        this.state.intervals.forEach((interval) => {
            clearInterval(interval);
        })
    },
    render: function() {
        return (
            <AccountsList accounts={this.state.accounts}></AccountsList>
        )
    }
});