const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;
  let num = Math.ceil(items.length / pageSize);
  console.log(items.length);
  let pages = range(1, num + 1);
  const list = pages.map((page) => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) /* 30, 2, 10 */ {
  // # items to pass, what page we are on, items per page
  const start = (pageNumber - 1) * pageSize; // ( 2 - 1 ) * 10 = 10 // start at page 10
  let page = items.slice(start, start + pageSize); // takes out the 10th - 20th item
  return page; // return the 10th - 20th item in an array
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  // useReducer function
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);

  useEffect(() => {
    const fetchSelections = async () => {
      let selectionUrl =
        "https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list";
      let results = await axios(selectionUrl);
      console.log("selections", results.data.drinks);
    };
    fetchSelections();
  });

  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("Margarita");
  const [currentPage, setCurrentPage] = useState(1);
  const [numPerPage, setNumPerPage] = useState(10);
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita",
    {
      drinks: [],
    }
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  const numPageHandler = (e) => {
    setNumPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  console.log(data);
  let page = data.drinks;

  if (page.length >= 1) {
    page = paginate(page, currentPage, numPerPage);
  }

  const ingredients = data.drinks.map((item) => {
    var keys = Object.keys(item);
    const strIngredientKeys = keys
      .filter((key) => {
        return key.includes("strIngredient");
      })
      .filter((key) => {
        return item[key] !== null;
      })
      .map((key, i) => {
        const theNum = key.match(/\d+/)[0];
        return `${
          item["strMeasure" + theNum] == null ? "" : item["strMeasure" + theNum]
        } ${item[key]}`;
      });
    return strIngredientKeys;
  });

  return (
    <Fragment>
      <form
        onSubmit={(event) => {
          doFetch(
            `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`
          );
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <label htmlFor="numPerPage"># Hits per Page:</label>
      <select
        value={numPerPage}
        onChange={numPageHandler}
        name="numPerPage"
        id="numPerPage"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={50}>50</option>
      </select>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul>
          {page.map((item, i) => (
            <>
              <li key={item.idDrink}>
                <a href={item.strDrinkThumb}>{item.strDrink}</a>
                <ul>
                  {ingredients[i].map((ingredient) => {
                    return <li>{ingredient}</li>;
                  })}
                </ul>
              </li>
            </>
          ))}
        </ul>
      )}

      <Pagination
        items={data.drinks} // data we've retrieved
        pageSize={numPerPage} // this is defined above in the App to be 10
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
