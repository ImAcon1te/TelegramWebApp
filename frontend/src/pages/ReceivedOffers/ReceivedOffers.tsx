import {RolesMap} from "../../types/common.ts";
import {useOffersReceived} from "../../service/useOffersReceived.ts";
import {useAppStore} from "../../store/store.ts";
import {Tabs, TabsVariant} from "../../components/Tabs/Tabs.tsx";

export const ReceivedOffers = () => {
  const {activeRole} = useAppStore();

  const {data: receivedList, isLoading} = useOffersReceived(activeRole)
  if(isLoading){
    return null
  }else if(!receivedList || receivedList.length < 1){
    if(activeRole === RolesMap.CULTURE){
      return (
        <div>
          <Tabs variant={TabsVariant.NOTIFICATIONS} />
          <div className="no-text">У вас немає отриманих заявок на культуру</div>
        </div>
      )
    }else{
      return (
        <div>
          <Tabs variant={TabsVariant.NOTIFICATIONS} />
          <div className="no-text">У вас немає отриманих заявок на техніку</div>
        </div>
      )
    }
  }
  return (
    <div>
      <Tabs variant={TabsVariant.NOTIFICATIONS} />
    </div>
  )
}