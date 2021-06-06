/**
 * This component comes from the following source:
 * https://github.com/MattDobsonWeb/movie-watchlist-react
 * Slight modifications have been made
 */
class StockLogoComponent extends React.Component {
    constructor(props) {
        super(props);

    }

    async componentDidMount() {
        await this.props.refreshWatchlist();
    }

    render() {
        return (
            <div className="movie-card">
                <div className="overlay"></div>

                <img
                    src={`//logo.clearbit.com/${this.props.stock.text}.com`}
                    alt={`${this.props.stock.text} Logo`}
                />

                <StockControlsComponent
                    onRemoveFromWatchlist={(stock) => this.props.onRemoveFromWatchlist(stock)}
                    onNavToNewsPage={(stock) => this.props.onNavToNewsPage(stock)}
                    refreshWatchlist={() => this.props.refreshWatchlist()}
                    stock={this.props.stock} />
            </div>
        );
    }

}

