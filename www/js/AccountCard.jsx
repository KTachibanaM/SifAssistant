var AccountCard = React.createClass({
    render: function() {
        return (
            <div className='card'>
                <div className='item item-text-wrap'>
                    <p>Alias: {this.props.account.alias}</p>
                    <p>Rank: {this.props.account.level}</p>
                    <p>EXP: {this.props.account.exp}</p>
                    <p>LP: {this.props.account.lp}</p>
                    <p>Next LP: {this.props.account.next_lp}</p>
                    <p>Love gems: {this.props.account.loveca}</p>
                </div>
            </div>
        )
    }
});