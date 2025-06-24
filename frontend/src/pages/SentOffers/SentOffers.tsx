import {RolesMap} from "../../types/common.ts";
import {useAppStore} from "../../store/store.ts";
import {Tabs, TabsVariant} from "../../components/Tabs/Tabs.tsx";
import {useOffersSent} from "../../service/useOffersSent.ts";

export const SentOffers = () => {
  const {activeRole} = useAppStore();

  const {data: sentList, isLoading} = useOffersSent(activeRole)
  if(isLoading){
    return null
  }else if(!sentList || sentList.length < 1){
    if(activeRole === RolesMap.CULTURE){
      return (
        <div>
          <Tabs variant={TabsVariant.NOTIFICATIONS} />
          <div className="no-text">У вас немає відправлених заявок на культуру</div>
        </div>
      )
    }else{
      return (
        <div>
          <Tabs variant={TabsVariant.NOTIFICATIONS} />
          <div className="no-text">У вас немає відправлених заявок на техніку</div>
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