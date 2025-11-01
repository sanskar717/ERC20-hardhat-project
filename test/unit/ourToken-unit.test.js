const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("OurToken Unit Test", () => {
  let token
  let owner, spender, recipient, other

  const INITIAL_SUPPLY = ethers.utils.parseUnits("1000", 18)
  const TRANSFER_AMOUNT = ethers.utils.parseUnits("100", 18)
  const APPROVE_AMOUNT = ethers.utils.parseUnits("50", 18)

  beforeEach(async () => {
    ;[owner, spender, recipient, other] = await ethers.getSigners()

    const Token = await ethers.getContractFactory("OurToken")
    token = await Token.deploy(INITIAL_SUPPLY)
    await token.deployed()
  })

  describe("constructor", () => {
    it("Should have correct INITIAL_SUPPLY of token", async () => {
      const totalSupply = await token.totalSupply()
      expect(totalSupply).to.equal(INITIAL_SUPPLY)
    })

    it("initializes the token with the correct name and symbol", async () => {
      expect(await token.name()).to.equal("OurToken")
      expect(await token.symbol()).to.equal("OT")
    })
  })

  describe("transfers", () => {
    it("Should be able to transfer tokens successfully to an address", async () => {
      await token.transfer(recipient.address, TRANSFER_AMOUNT)
      const balance = await token.balanceOf(recipient.address)
      expect(balance).to.equal(TRANSFER_AMOUNT)
    })

    it("emits a transfer event, when a transfer occurs", async () => {
      await expect(token.transfer(recipient.address, TRANSFER_AMOUNT))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, recipient.address, TRANSFER_AMOUNT)
    })
  })

  describe("allowances", () => {
    it("Should approve other address to spend token", async () => {
      await token.approve(spender.address, APPROVE_AMOUNT)
      const allowance = await token.allowance(owner.address, spender.address)
      expect(allowance).to.equal(APPROVE_AMOUNT)
    })

    it("doesn't allow an unapproved member to do transfers", async () => {
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, recipient.address, APPROVE_AMOUNT),
      ).to.be.revertedWith("ERC20: insufficient allowance")
    })

    it("emits an approval event, when an approval occurs", async () => {
      await expect(token.approve(spender.address, APPROVE_AMOUNT))
        .to.emit(token, "Approval")
        .withArgs(owner.address, spender.address, APPROVE_AMOUNT)
    })

    it("the allowance being set is accurate", async () => {
      await token.approve(spender.address, APPROVE_AMOUNT)
      const allowance = await token.allowance(owner.address, spender.address)
      expect(allowance).to.equal(APPROVE_AMOUNT)
    })

    it("won't allow a user to go over the allowance", async () => {
      await token.approve(spender.address, APPROVE_AMOUNT)
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, recipient.address, TRANSFER_AMOUNT),
      ).to.be.revertedWith("ERC20: insufficient allowance")
    })
  })
})
