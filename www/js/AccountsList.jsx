var AccountsList = React.createClass({
    render: function() {
        var accountNodes = this.props.accounts.map((account) => {
            return (
                <AccountCard key={account.alias} account={account}></AccountCard>
            )
        });
        return (
            <div>
                {accountNodes}
            </div>
        )
    }
});