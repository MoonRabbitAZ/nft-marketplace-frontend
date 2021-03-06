import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { backendUrl } from '../constants/variables';

const limit = 9;

export default function useTokenList({ query, pageNumber, nftType, handleTab }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setTokens([]);
    if (location.state && location.state.page === 'home') {
      handleTab('nfts');
    }
  }, [query, nftType, location.state]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    let cancel;

    let nftTypeUrl = nftType === 'collections' ? 'collections' : 'marketplace';
    axios({
      method: 'GET',
      url: `${backendUrl}${nftTypeUrl}/`,
      params: { sort: query || '', limit: limit, offset: (pageNumber - 1) * limit },
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    })
      .then((res) => {
        if (nftTypeUrl !== 'collections') {
          if (res.data.NftsForSale.length > 0) {
            setTokens((prevTokens) => {
              return [...new Set([...prevTokens, ...res.data.NftsForSale])];
            });
            setHasMore(true);
          } else {
            setHasMore(false);
          }
          setLoading(false);
        } else {
          if (res.data.Collections.length > 0) {
            setTokens((prevTokens) => {
              return [...new Set([...prevTokens, ...res.data.Collections])];
            });
            setHasMore(true);
          } else {
            setHasMore(false);
          }
          setLoading(false);
        }
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setError(true);
      });
    return () => cancel();
  }, [query, pageNumber, nftType, location.state]);

  return { loading, error, tokens, hasMore, setTokens };
}
