var App = React.createClass({
    getInitialState: function() {
        return {
            accounts: [
                {
                    alias: "test1",
                    level: 5,
                    exp: 23,
                    lp: 4, // Changing per second
                    next_lp: "Todo", // Changing per second
                    love_gems: 233
                },
                {
                    alias: "test2",
                    level: 100,
                    exp: 2333,
                    lp: 70, // Changing per second
                    next_lp: "Todo", // Changing per second
                    love_gems: 0
                }
            ]
        }
    },
    render: function() {
        return (
            <AccountList accounts={this.state.accounts}></AccountList>
        )
    }
});