/**
 * This component comes from the following source:
 * https://github.com/MattDobsonWeb/movie-watchlist-react
 * Slight modifications have been made
 */
class ResultComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // is stock in watchlist and cannot be added anymore?
            inWatchlist: false,
            price: ''
        }

    }


    async componentDidMount() {
        await this.props.refreshWatchlist();
        if (this.props.watchlist.find(stockToWatch => stockToWatch.text === this.props.stock)) {
            this.setState({inWatchlist: true})
        }
        await this.getInfo(this.props.stock);

    }

    getInfo = async(stock) => {

        const rawData = this.props.news;
        const data = this.props.news.filter(news => Object.keys(news).indexOf(stock) !== -1);
        this.setState({price: "News from " + data[0][stock].articles[0].publishedAt.substring(0, data[0][stock].articles[0].publishedAt.indexOf('T')) + " available"});

        // fetch(
        //     `https://newsapi.org/v2/everything?q=${stock}&from=2021-05-03&sortBy=publishedAt&apiKey=${NEWSAPI_API_KEY}`
        //
        // )
        //     .then((res) => res.json())
        //     .then((data) => {
        //         console.log(data);
        //         console.log("News from: ", data.articles[0].publishedAt);
        //         this.setState({price: "News from: " + data.articles[0].publishedAt.substring(0, data.articles[0].publishedAt.indexOf('T'))});
        //         // return "News from: " + data.articles[0].publishedAt;
        //
        //         // if (!data.errors) {
        //         //     setResults(data.results);
        //         // } else {
        //         //     setResults([]);
        //         // }
        //     }).catch(e => console.log(e));


    }

    addToWatchlist = async(stock) => {
        const success = await this.props.onAddToWatchlist(stock);
        // await this.props.refreshWatchlist();
        if (success)
            this.setState({inWatchlist: true});
    }

    removeFromWatchlist = async(stock) => {
        const success = await this.props.onRemoveFromWatchlist(stock);
        if (success)
            this.setState({inWatchlist: false});
        // else
        //     console.log("Failed");
    }

    render() {
        return (
            <div className="result-card">
                <div className="poster-wrapper">
                    {true ? (
                        <img
                            src={`//logo.clearbit.com/${this.props.stock}.com`}
                            alt={`${1 + 1} Poster`}
                        />
                    ) : (
                        <div className="filler-poster" />
                    )}
                </div>
                <div className="info">
                    <div className="header">
                        <h3 className="title">{this.props.stock}</h3>
                        <h4 className="release-date">
                            <div >{this.state.price}</div>
                        </h4>
                    </div>

                    <div className="controls">
                        <button
                            className="btn"
                            disabled={this.state.inWatchlist}
                            onClick={() => this.addToWatchlist(this.props.stock)}
                        >
                            Add to Watchlist
                        </button>

                        <button
                            className="btn"
                            disabled={!this.state.inWatchlist}
                            onClick={() => this.removeFromWatchlist(this.props.stock)}
                        >
                            Remove from watchlist
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
