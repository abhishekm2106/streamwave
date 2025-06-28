import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";

const useUserFirends = () => {
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });
  console.log({ friends });
  return { friends, loadingFriends };
};

export default useUserFirends;
