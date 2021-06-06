
class NewsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.liKey = 0;
    }

    componentDidMount() {
        this.key = Object.keys(this.props.news[0]);
    }

    extractKey = () => {
        this.key = Object.keys(this.props.news[0]);
        return this.key;
    }

    useLiKey = () => {
        this.liKey += 1;
        return this.liKey;
    }




    render() {
        return (
            <>
            {
                this.props.news.length > 0 && (

                    <div className={"container"} style={{marginTop: '1em'}}>
                        <ul style={{listStyleType: 'none'}}>
                            {
                                // const key = Object.keys(this.props.news[0]);
                                this.props.news[0][this.extractKey()].articles.map((article, id) => (

                                        <li key={id}>
                                            <img
                                            style={{float: 'left', marginTop: '0', marginRight: '5px', marginBottom: '0', marginLeft: '0', width:'250px', height: '150px'}}
                                            src={article.urlToImage} />
                                            <h3 style={{font: 'bold 25px/1.5 Helvetica, Verdana, sans-serif'}}>{article.title}</h3>
                                            <p style={{font: '200 15px/1.5 Georgia, Times New Roman, serif' }}
                                            >
                                                Published at {article.publishedAt.substring(0, article.publishedAt.indexOf('T'))}, by {article.author}<br />


                                                <a href={article.url}>Read more..</a></p>
                                            <br />
                                            <br />
                                            <br />
                                        </li>


                                ))

                            }


                        </ul>
                    </div>
                )

            }
            </>


        );

    }
}