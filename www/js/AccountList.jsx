var AccountList = React.createClass({
    render: function() {
        var accountNodes = this.props.accounts.map(function (account) {
            return (
                <AccountCard className='item' key={account.alias} account={account}></AccountCard>
            )
        });
        return (
            <div className='list'>
                {accountNodes}
            </div>
        )
    }
});