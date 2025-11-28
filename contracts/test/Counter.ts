import { network } from "hardhat";

const provider = await network.connect();
const { ethers } = provider;

describe("Counter", function () {
  it("empty test", async function () {
    console.log("Cool! The test basic skeleton is running!");
  });
});