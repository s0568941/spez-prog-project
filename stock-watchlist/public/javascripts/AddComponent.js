/**
 * This component comes from the following source:
 * https://github.com/MattDobsonWeb/movie-watchlist-react
 * Slight modifications have been made
 */
class AddComponent extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            query: '',
            displayedStocks: []
        }

    }

    componentDidMount() {
        if (this.props.stocks.length > 0 && this.state.displayedStocks.length === 0)
            this.setState({displayedStocks: this.props.stocks});
    }

    onChange = (e) => {
        e.preventDefault();
        this.setState({query: e.target.value});
        const queriedStocks = this.props.stocks.filter((stock) => stock.toLowerCase().startsWith(this.state.query.toLowerCase()));
        if (this.state.query.length > 1)
            this.setState({displayedStocks: queriedStocks})
        else
            this.setState({displayedStocks: this.props.stocks})
    };

    onKeyPress = (e) => {
        if (e.key !== "Enter") return;


        // fetch("https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete?q=tesla&region=US", {
        //     "method": "GET",
        //     "headers": {
        //         "x-rapidapi-key": "c2b3e4e340msh0c60f30cfcc65f7p15cbd1jsncfbd738d1bb7",
        //         "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
        //     }
        // })
        //     .then(response => {
        //         console.log(response);
        //     })
        //     .catch(err => {
        //         console.error(err);
        //     });

        // fetch(
        //     `https://newsapi.org/v2/everything?q=${this.state.query}&from=2021-05-03&sortBy=popularity&apiKey=${NEWSAPI_API_KEY}`
        //
        // )
        //     .then((res) => res.json())
        //     .then((data) => {
        //         console.log(data);
        //
        //         // if (!data.errors) {
        //         //     setResults(data.results);
        //         // } else {
        //         //     setResults([]);
        //         // }
        //     }).catch(e => console.log(e));
    }



    render() {
        // if (this.props.stocks.length > 0 && this.state.displayedStocks.length === 0)
        //     this.setState({displayedStocks: this.props.stocks});
        return (
            <div className="add-page">
                <div className="container">
                    <div className="add-content">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder="Search for a stock.."
                                id="query-input"
                                value={this.state.query}
                                onChange={this.onChange}
                                onKeyPress={this.onKeyPress}
                            />
                        </div>

                        {/*{*/}
                        {/*    this.props.stocks.length > 0 && (*/}
                        {/*        <>*/}
                        {/*            {(this.state.displayedStocks.length === 0) && this.setState({displayedStocks: this.props.stocks})}*/}
                        {/*        </>*/}
                        {/*    )*/}
                        {/*}*/}


                        {this.props.stocks.length > 0 && this.props.news.length > 0  && (
                            <ul className="results">
                                {this.state.displayedStocks.map((stock) => (
                                    <li key={this.props.stocks.indexOf(stock)}>
                                        <ResultComponent
                                            onAddToWatchlist={(stock) => this.props.onAddToWatchlist(stock)}
                                            onRemoveFromWatchlist={(stock) => this.props.onRemoveFromWatchlist(stock)}
                                            refreshWatchlist={() => this.props.refreshWatchlist()}
                                            watchlist={this.props.watchlist}
                                            news={this.props.news}
                                            stock={stock} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        );
    }

}
