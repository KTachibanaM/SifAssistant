var AccountCard = React.createClass({
    render: function() {
        return (
            <div>
                <div>
                    <p>Alias: {this.props.account.alias}</p>
                    <p>Rank: {this.props.account.level}</p>
                    <p>EXP: {this.props.account.exp}</p>
                    <p>LP: {this.props.account.lp}</p>
                    <p>Next LP: {this.props.account.next_lp / 60}</p>
                    <p>Love gems: {this.props.account.loveca}</p>
                </div>
            </div>
        )
    }
});