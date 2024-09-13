import { useContext, useEffect, useState } from 'react';
import { Card, Button, Spinner, Container } from 'react-bootstrap';
import axios from 'axios';
import './NewsList.css';
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import "../App.css";

interface Article {
  id: number;
  title: string;
  summary: string;
  link: string;
  image: string;
  pubDate: string;
}

const NewsList = () => {
  const { user } = useContext(UserContext);

  const [article, setarticle] = useState<Article[]>([]);
  const [loading, setloading] = useState<boolean>(true);
  const [currpage, setCurrPage] = useState<number>(1);
  const [category, setcategory] = useState<string>("politics");

  const navigate = useNavigate();
  const page = 15;

  useEffect(() => {
    const fetcharticle = async () => {
      setloading(true);
      try {
        const response = await axios.get<Article[]>(`http://localhost:3001/api/news/news/${category}`);
        const sortedArticles = response.data.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        setarticle(sortedArticles);
      } catch (error) {
        console.error("Error fetching articles", error);
      } finally {
        setloading(false);
      }
    };

    fetcharticle();
  }, [category]);

  const startIndex = (currpage - 1) * page;
  const currarticle = article.slice(startIndex, startIndex + page);

  const handleread = (link: string) => {
    window.open(link, '_blank');
  };

  const handlenext = () => {
    if (currpage < Math.ceil(article.length / page)) {
      setCurrPage((prevPage) => prevPage + 1);
    }
  };

  const handleprev = () => {
    if (currpage > 1) {
      setCurrPage((prevPage) => prevPage - 1);
    }
  };

  const truncatetext = (text: string, maxWords: number): string => {
    const words = text.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
  };


  const handlecategory = (category: string) => {
    setcategory(category);
    setCurrPage(1);
  };

  const handlesubscribe = async () => {
    if (!user) {
      alert("Please log in to subscribe");
      navigate("/");
      return;
    }




    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("user");

      if (!email) {
        alert("No email found. Please log in");
        navigate("/");
        return;
      }

      const response = await axios.post(
        `http://localhost:3001/api/news/subscribe`,
        { email, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert("Subscribed successfully! You will receive notifications for this category.");
      } else {
        alert("Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Error during subscription:", error);
      alert("An error occurred while subscribing.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status" style={{ marginTop: "20%" }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options).replace(',', ' at');
  };

  return (
    <>
      <div className="box">
        <Container className="mt-4">
          <div className="d-flex justify-content-center mb-4">
            <Button variant="outline-primary" onClick={() => handlecategory('politics')}>Politics</Button>
            <Button variant="outline-primary" onClick={() => handlecategory('technology')} className="mx-2">Technology</Button>
            <Button variant="outline-primary" onClick={() => handlecategory('food')}>Food</Button>
            <Button variant="outline-primary" onClick={() => handlecategory('entertainment')} className="mx-2">entertainment</Button>
          </div>

          <div className="article-container ">
            {currarticle.map((article) => (
              <div key={article.id} className="col-md-4 d-flex justify-content-center">
                <div className="card-container">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>{truncatetext(article.title, 10)}</Card.Title>
                      {article.image && (
                        <Card.Img
                          variant="top"
                          src={article.image}
                          alt={article.title}
                          className="custom-image mb-3"
                        />
                      )}
                      <Card.Text>{truncatetext(article.summary, 40)}</Card.Text>
                      <Card.Text className="pub-date">
                        {formatDate(article.pubDate)}
                      </Card.Text>

                      <div className="button-container">
                        <Button
                          variant="primary"
                          onClick={() => handleread(article.link)}
                          className="read-more-btn"
                        >
                          Read More
                        </Button>
                        <Button
                          variant="success"
                          onClick={handlesubscribe}
                          className="subscribe-btn"
                        >
                          Subscribe
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between mt-3">
            <Button variant="secondary" onClick={handleprev} disabled={currpage === 1}>
              Previous Page
            </Button>
            <span>Page {currpage} of {Math.ceil(article.length / page)}</span>
            <Button
              variant="secondary"
              onClick={handlenext}
              disabled={currpage >= Math.ceil(article.length / page)}
            >
              Next Page
            </Button>
          </div>
        </Container>
      </div>
    </>
  );
};

export default NewsList;