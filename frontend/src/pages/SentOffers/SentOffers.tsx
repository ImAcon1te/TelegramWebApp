import {RolesMap} from "../../types/common.ts";
import {useAppStore} from "../../store/store.ts";
import {Tabs, TabsVariant} from "../../components/Tabs/Tabs.tsx";
import {useOffersSent} from "../../service/useOffersSent.ts";

export const SentOffers = () => {
  const {activeRole} = useAppStore();

  const {data: sentList, isLoading} = useOffersSent(activeRole)
  console.log('sentList', sentList)
  if(isLoading){
    return null
  }else if(!sentList || sentList.length < 1){
    return (
      <div>
        <Tabs variant={TabsVariant.NOTIFICATIONS} />
        <div className="no-text">У вас немає відправлених заявок на {activeRole === RolesMap.CULTURE ? 'культуру' : 'техніку'}</div>
      </div>
    )
  }
  return (
    <div>
      <Tabs variant={TabsVariant.NOTIFICATIONS} />
    </div>
  )
}