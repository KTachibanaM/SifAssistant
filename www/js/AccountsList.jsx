import AccountCard from './AccountCard.jsx'

export default class AccountsList extends React.Component {
    static render() {
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
};