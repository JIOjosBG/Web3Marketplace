# #produkt
# koi go e kachil
# koga pochva aukciona
# koga svyrshva aukciona
# minimalna cena
# naddavane:
# -koi
# -kolko (tova e i tekushta cena)


#mapping from nft id to seller
#uint -> address
productSeller={}

#has seller been paid
#uint -> bool
isSellerPaid={}

#data for item
#uint -> bytes
productData={}

#mapping from nft id to currentBid
#uint -> uint
productCurrentHighestBidValue={}

#mapping from nft id to bidder
#uint -> address
productCurrentHighestBidder={}

#mapping from nftid to start date(as uint)
#uint -> uint
productStartDate={}

#mapping from nftid to end date(as uint)
#uint -> uint
productEndDate={}


def addItem(start,end,price, data):
    #adds start,edn price and data
    return

def bid(itemID,amount):
    #validaciq dali e vreme za bidvane s productStartDate
    #validaciq dali e izteklo vremeto s productEndDate
    #validaciq dali amount>productCurrentHighestBidValue[itemID]
    #(prehvyrlqna na tokeni ot bidder->smart contracta)
    #vrushtane na tokenite na predniq bidder
    #update na productCurrentHighestBidValue i productCurrentHighestBidder
    return


#product seller takes the money after the auction
def takeMoney(itemID):
    #check msg.sender==productSeller[itemID]
    #check time>productEndDate[itemID]
    #isSellerPaid[productSeller[itemID]]
    #transfer productCurrentHighestBidValue[itemID] to msg.sender
    return